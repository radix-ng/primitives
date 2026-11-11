import { expect, type Page } from '@playwright/test';
import type { CaseName, Probe } from '../src/contract';

export class MenuDriver {
    readonly checkpoints: { name: string; state: Record<string, unknown> }[] = [];
    readonly measurements: { name: string; bounds: unknown }[] = [];
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
    get trigger() {
        return this.page.getByTestId('primary');
    }
    get popup() {
        return this.page.getByTestId('popup');
    }
    get subPopup() {
        return this.page.getByTestId('sub-popup');
    }
    item(id: string) {
        return this.page.getByTestId(id);
    }
    async goto(name: CaseName) {
        if (name.startsWith('root-remove-')) await this.page.clock.install();
        await this.page.goto(`/${this.framework}.html?case=${name}`);
        await expect(this.trigger).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.menuParity.reference);
        await this.checkpoint('initial');
    }
    async open(key: string = 'Enter') {
        if (key === 'mouse') await this.trigger.click();
        else await this.trigger.press(key);
        await expect(this.popup).toBeVisible();
        await expect.poll(() => this.page.evaluate(() => window.menuParity.completions.main.at(-1))).toBe(true);
    }
    async closed() {
        await expect(this.trigger).toHaveAttribute('aria-expanded', 'false');
        const retained = await this.page.evaluate(() => window.menuParity.config.lifecycle?.keepMounted ?? false);
        if (retained) {
            await expect(this.popup).toHaveCount(1);
            await expect(this.popup).toBeHidden();
        } else await expect(this.popup).toHaveCount(0);
        await expect(this.subPopup).toHaveCount(0);
        await expect.poll(() => this.page.evaluate(() => window.menuParity.completions.main.at(-1))).toBe(false);
    }
    async navigateTo(id: string) {
        for (let step = 0; step < 12; step++) {
            const focused = await this.page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
            if (focused === id) return;
            await this.page.keyboard.press('ArrowDown');
        }
        await expect(this.item(id)).toBeFocused();
    }
    async outside() {
        const box = (await this.item('outside').boundingBox())!;
        await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    async hoverItem(id: string) {
        const box = (await this.item(id).boundingBox())!;
        // A real path across the item distinguishes movement from WebKit's initial zero-delta event.
        await this.page.mouse.move(box.x + 4, box.y + box.height / 2);
        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 });
    }
    async openSub(rtl = false, key = rtl ? 'ArrowLeft' : 'ArrowRight') {
        await this.navigateTo('more');
        await this.page.keyboard.press(key);
        await expect(this.subPopup).toBeVisible();
        await expect.poll(() => this.page.evaluate(() => window.menuParity.completions.sub.at(-1))).toBe(true);
        await expect(this.item('sub-alpha')).toBeFocused();
    }
    async checkpoint(name: string, expected: Record<string, unknown> = {}) {
        const state = await this.page.evaluate(async () => {
            const read = () => {
                const popup = document.querySelector<HTMLElement>('[data-testid="popup"]');
                const sub = document.querySelector<HTMLElement>('[data-testid="sub-popup"]');
                const trigger = document.querySelector<HTMLElement>('[data-testid="primary"]')!;
                const positioner = document.querySelector<HTMLElement>('[data-testid="positioner"]');
                const items = [...document.querySelectorAll<HTMLElement>('[role^="menuitem"]')];
                const visible = (el: HTMLElement | null) =>
                    !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
                const labelled = (el: HTMLElement | null) =>
                    !!el
                        ?.getAttribute('aria-labelledby')
                        ?.split(/\s+/)
                        .every((id) => document.getElementById(id)?.textContent?.trim());
                return {
                    ...(window.menuParity.config.lifecycle
                        ? {
                              ending: popup?.hasAttribute('data-ending-style') ?? false,
                              inert: positioner?.hasAttribute('inert') ?? false,
                              pointerBlocked: !!positioner && getComputedStyle(positioner).pointerEvents === 'none'
                          }
                        : {}),
                    open: trigger?.getAttribute('aria-expanded') === 'true',
                    disabled:
                        !!trigger &&
                        (trigger.hasAttribute('disabled') || trigger.getAttribute('aria-disabled') === 'true'),
                    mounted: !!popup,
                    visible: visible(popup),
                    role: popup?.getAttribute('role') ?? null,
                    labelled: labelled(popup),
                    controlsLinked: !!popup && trigger?.getAttribute('aria-controls') === popup.id,
                    // Both implementations omit expanded on keyboard-opened submenus for macOS
                    // VoiceOver. Observe the actual layer rather than inventing a missing attribute.
                    subOpen: !!sub && !sub.hasAttribute('data-closed'),
                    subVisible: visible(sub),
                    subLabelled: labelled(sub),
                    focus:
                        document.activeElement === document.body
                            ? 'body'
                            : (document.activeElement?.getAttribute('data-testid') ?? 'other'),
                    highlighted: items
                        .filter((el) => el.hasAttribute('data-highlighted'))
                        .map((el) => el.dataset.testid),
                    items: items.map((el) => ({
                        id: el.dataset.testid,
                        role: el.getAttribute('role'),
                        disabled: el.getAttribute('aria-disabled') === 'true'
                    })),
                    checked: document.querySelector('[data-testid="check"]')?.getAttribute('aria-checked') ?? null,
                    radio: items
                        .filter(
                            (el) =>
                                el.getAttribute('role') === 'menuitemradio' &&
                                el.getAttribute('aria-checked') === 'true'
                        )
                        .map((el) => el.dataset.testid),
                    selected: window.menuParity.selected,
                    values: window.menuParity.values,
                    activations: window.menuParity.activations,
                    changes: window.menuParity.changes,
                    completions: window.menuParity.completions
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
            throw new Error('Menu did not settle');
        });
        this.checkpoints.push({ name, state });
        expect(state, `${this.framework}: ${name}`).toEqual(expect.objectContaining(expected));
        expect(this.errors).toEqual([]);
    }
}
