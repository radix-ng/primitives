import { expect, type Page } from '@playwright/test';
import type { CaseName, Probe } from '../src/contract';

export class PopoverDriver {
    readonly checkpoints: { name: string; state: Record<string, unknown> }[] = [];
    readonly measurements: { name: string; bounds: unknown }[] = [];
    readonly errors: string[] = [];
    metadata?: Probe['reference'];
    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (e) => this.errors.push(e.message));
        page.on('console', (m) => {
            if (m.type() === 'error') this.errors.push(m.text());
        });
    }
    get trigger() {
        return this.page.getByTestId('primary');
    }
    get popup() {
        return this.page.getByTestId('popup');
    }
    async goto(name: CaseName) {
        await this.page.goto(`/${this.framework}.html?case=${name}`);
        await expect(this.trigger).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.popoverParity.reference);
        await this.checkpoint('initial');
    }
    async open(pointer = false) {
        if (pointer) await this.trigger.click();
        else await this.trigger.press('Enter');
        await expect(this.popup).toBeVisible();
        await expect.poll(() => this.page.evaluate(() => window.popoverParity.completions.at(-1))).toBe(true);
    }
    async closed() {
        await expect(this.trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(this.popup).toHaveCount(0);
        await expect.poll(() => this.page.evaluate(() => window.popoverParity.completions.at(-1))).toBe(false);
    }
    async outside() {
        const box = (await this.page.getByTestId('outside').boundingBox())!;
        await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    async bounds(name: string) {
        const bounds = await this.page.evaluate(() => {
            const primary = document.querySelector('[data-testid="primary"]')!;
            const popup = document.querySelector('[data-testid="popup"]')!;
            const positioner = document.querySelector('[data-testid="positioner"]')!;
            return {
                trigger: primary.getBoundingClientRect().toJSON(),
                popup: popup.getBoundingClientRect().toJSON(),
                side: positioner.getAttribute('data-side'),
                anchorWidth: getComputedStyle(positioner).getPropertyValue('--anchor-width'),
                scrollTop: document.querySelector('[data-testid="scroller"]')!.scrollTop
            };
        });
        this.measurements.push({ name, bounds });
        return bounds;
    }
    async checkpoint(name: string, expected: Record<string, unknown> = {}) {
        const state = await this.page.evaluate(async () => {
            const read = () => {
                const popup = document.querySelector<HTMLElement>('[data-testid="popup"]');
                const active = document.activeElement;
                const triggers = [
                    ...document.querySelectorAll<HTMLElement>('[data-testid="primary"],[data-testid="secondary"]')
                ];
                const linked = (attr: string) =>
                    !!popup
                        ?.getAttribute(attr)
                        ?.split(/\s+/)
                        .every((id) => document.getElementById(id)?.textContent?.trim());
                const style = popup && getComputedStyle(popup);
                return {
                    open: triggers.some((el) => el.getAttribute('aria-expanded') === 'true'),
                    expanded: triggers
                        .filter((el) => el.getAttribute('aria-expanded') === 'true')
                        .map((el) => el.dataset.testid),
                    disabled: triggers[0].hasAttribute('disabled'),
                    mounted: !!popup,
                    visible: !!popup && !popup.hidden && style?.display !== 'none' && style?.visibility !== 'hidden',
                    role: popup?.getAttribute('role') ?? null,
                    labelled: linked('aria-labelledby'),
                    described: linked('aria-describedby'),
                    focus: active === document.body ? 'body' : (active?.getAttribute('data-testid') ?? 'other'),
                    value: document.querySelector<HTMLInputElement>('[data-testid="field"]')?.value ?? null,
                    anchorHidden:
                        document.querySelector('[data-testid="positioner"]')?.hasAttribute('data-anchor-hidden') ??
                        false,
                    activations: window.popoverParity.activations,
                    changes: window.popoverParity.changes,
                    completions: window.popoverParity.completions
                };
            };
            let previous = '',
                stable = 0;
            for (let frame = 0; frame < 120; frame++) {
                await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                const json = JSON.stringify(read());
                stable = json === previous ? stable + 1 : 0;
                if (stable >= 3) return JSON.parse(json) as Record<string, unknown>;
                previous = json;
            }
            throw new Error('Popover did not settle');
        });
        this.checkpoints.push({ name, state });
        expect(state, `${this.framework}: ${name}`).toEqual(expect.objectContaining(expected));
        expect(this.errors).toEqual([]);
    }
}
