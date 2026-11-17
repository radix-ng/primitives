import { expect, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare';
import type { Probe } from '../src/contract';

export class ButtonDriver {
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
    async goto(name: string) {
        await this.page.goto(`/${this.framework}.html?case=${name}`);
        await expect(this.page.getByTestId('subject')).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.buttonParity.reference);
    }
    async pointerClick() {
        const box = (await this.page.getByTestId('subject').boundingBox())!;
        await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    async focusSubject() {
        await this.page.getByTestId('field').focus();
        await this.page.keyboard.press('Tab');
        await expect(this.page.getByTestId('subject')).toBeFocused();
    }
    async checkpoint(name: string, expected: Record<string, unknown> = {}) {
        const read = () =>
            this.page.evaluate(() => {
                const element = document.querySelector<HTMLElement>('[data-testid="subject"]')!;
                const probe = window.buttonParity;
                return {
                    host: {
                        tag: element.tagName,
                        role: element.getAttribute('role'),
                        type: element.getAttribute('type'),
                        disabled: element.hasAttribute('disabled'),
                        ariaDisabled: element.getAttribute('aria-disabled') === 'true',
                        dataDisabled: element.hasAttribute('data-disabled'),
                        tabIndex: element.tabIndex
                    },
                    focus:
                        document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName ?? null,
                    clicks: probe.clicks,
                    submits: probe.submits,
                    resets: probe.resets,
                    field: document.querySelector<HTMLInputElement>('[data-testid="field"]')!.value,
                    hash: location.hash,
                    scrolled: scrollY > 0,
                    ...(probe.settings.interaction?.scope === 'standalone' || probe.settings.interaction?.cancel
                        ? { handlers: probe.handlers }
                        : {}),
                    ...(probe.settings.interaction && probe.settings.interaction.scope !== 'standalone'
                        ? {
                              tabStops: [...document.querySelectorAll<HTMLElement>('[data-item]')].map(
                                  (item) => item.tabIndex
                              )
                          }
                        : {})
                };
            });
        if (expected.scrolled === true) await expect.poll(async () => (await read()).scrolled).toBe(true);
        let state = await read();
        let previous = '';
        let stable = 0;
        for (let frame = 0; frame < 120; frame++) {
            await this.page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
            state = await read();
            const current = JSON.stringify(state);
            stable = current === previous ? stable + 1 : 0;
            if (stable >= 3) break;
            if (frame === 119) throw new Error('Button did not settle');
            previous = current;
        }
        this.checkpoints.push({ name, state });
        this.measurements.push({ name, dom: await this.page.locator('body').innerHTML() });
        expect(state, `${this.framework}: ${name}`).toEqual(expect.objectContaining(expected));
        expect(this.errors).toEqual([]);
        return state;
    }
}
