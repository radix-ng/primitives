import { expect, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import type { CaseName, Probe } from '../src/contract';

export class DialogDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Probe['reference'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') this.errors.push(message.text());
        });
    }

    get popup() {
        return this.page.getByTestId('popup');
    }

    get field() {
        return this.page.getByTestId('field');
    }

    async goto(name: CaseName) {
        await this.page.goto(`/${this.framework}.html?case=${name}`);
        await expect(this.page.getByTestId('primary')).toBeAttached();
        this.metadata = await this.page.evaluate(() => window.dialogParity.reference);
    }

    trigger(id = 'primary') {
        return this.page.getByTestId(id);
    }

    async pointerAt(testId: string) {
        const box = await this.page.getByTestId(testId).boundingBox();
        if (!box) throw new Error(`Missing layout for ${testId}`);
        const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        await this.page.mouse.move(point.x, point.y);
        return point;
    }

    async open(id = 'primary') {
        await this.trigger(id).press('Enter');
        await this.opened();
    }

    async opened() {
        await expect(this.popup).toBeVisible();
        await expect(this.field).toBeFocused();
        await expect.poll(() => this.page.evaluate(() => window.dialogParity.completions.at(-1))).toBe(true);
    }

    async closed(retained = false) {
        await expect(this.popup).toHaveCount(retained ? 1 : 0);
        if (retained) await expect(this.popup).toBeHidden();
        await expect.poll(() => this.page.evaluate(() => window.dialogParity.completions.at(-1))).toBe(false);
    }

    async checkpoint(name: string, expected: Partial<Awaited<ReturnType<DialogDriver['observe']>>['state']> = {}) {
        const { state, raw } = await this.observe();
        this.checkpoints.push({ name, state });
        this.measurements.push({ name, ...raw });
        expect(state, name).toMatchObject(expected);
        expect(this.errors, `${name}: browser errors`).toEqual([]);
    }

    private async observe() {
        return this.page.evaluate(async () => {
            function read() {
                const popup = document.querySelector<HTMLElement>('[data-testid="popup"]');
                const backdrop = document.querySelector<HTMLElement>('[data-testid="backdrop"]');
                const field = document.querySelector<HTMLInputElement>('[data-testid="field"]');
                const outside = document.querySelector<HTMLElement>('[data-testid="outside"]');
                const triggers = [
                    ...document.querySelectorAll<HTMLElement>('[data-testid="primary"], [data-testid="secondary"]')
                ];
                const idrefText = (name: string) => {
                    const id = popup?.getAttribute(name);
                    return id ? (document.getElementById(id)?.textContent?.trim() ?? null) : null;
                };
                const visibility = (element: HTMLElement | null) =>
                    !!element?.getClientRects().length && getComputedStyle(element).visibility !== 'hidden';
                const active = document.activeElement as HTMLElement | null;
                const backgroundInert = !!outside?.closest('[inert]');
                const backgroundAriaHidden = !!outside?.closest('[aria-hidden="true"]');
                const scrollingOverflow = getComputedStyle(document.documentElement).overflow;
                const documentOverflow = getComputedStyle(document.body).overflow;

                return {
                    state: {
                        open: popup?.hasAttribute('data-open') ?? false,
                        ending: popup?.hasAttribute('data-ending-style') ?? false,
                        mounted: !!popup,
                        visible: visibility(popup),
                        backdrop: visibility(backdrop),
                        expanded: triggers
                            .filter((element) => element.getAttribute('aria-expanded') === 'true')
                            .map((element) => element.dataset.testid),
                        controls: triggers
                            .filter((element) => popup && element.getAttribute('aria-controls') === popup.id)
                            .map((element) => element.dataset.testid),
                        role: popup?.getAttribute('role') ?? null,
                        labelledBy: idrefText('aria-labelledby'),
                        describedBy: idrefText('aria-describedby'),
                        backgroundIsolated: backgroundInert || backgroundAriaHidden,
                        scrollLocked: [scrollingOverflow, documentOverflow].some((value) => value.includes('hidden')),
                        field: field?.value ?? null,
                        focus:
                            active?.dataset.testid ??
                            (active === document.body ? 'body' : (active?.tagName.toLowerCase() ?? null)),
                        changes: window.dialogParity.changes,
                        completions: window.dialogParity.completions,
                        activations: window.dialogParity.activations
                    },
                    raw: {
                        popup: popup?.outerHTML ?? null,
                        backdrop: backdrop?.outerHTML ?? null,
                        triggers: triggers.map((element) => element.outerHTML),
                        backgroundInert,
                        backgroundAriaHidden,
                        scrollingOverflow,
                        documentOverflow
                    }
                };
            }

            // Wait through several unchanged render frames without advancing application state.
            let snapshot = read();
            let previous = JSON.stringify(snapshot.state);
            let stable = 0;
            for (let frame = 0; frame < 45 && stable < 3; frame++) {
                await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                snapshot = read();
                const current = JSON.stringify(snapshot.state);
                stable = current === previous ? stable + 1 : 0;
                previous = current;
            }
            return snapshot;
        });
    }
}
