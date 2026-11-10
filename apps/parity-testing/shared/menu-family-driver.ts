import { expect, type Page } from '@playwright/test';
import type { MenuProbe } from './menu-probe.ts';

/** Browser recording for the actual Menu parts shared by Context Menu and Menubar. */
export class MenuFamilyDriver {
    readonly checkpoints: { name: string; state: Record<string, unknown> }[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: MenuProbe<unknown, string>['reference'];
    readonly page: Page;
    readonly framework: 'angular' | 'react';
    readonly probeKey: string;
    constructor(page: Page, framework: 'angular' | 'react', probeKey: string) {
        this.page = page;
        this.framework = framework;
        this.probeKey = probeKey;
        page.on('pageerror', (error) => this.errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') this.errors.push(message.text());
        });
    }
    async goto(name: string) {
        await this.page.goto(`/${this.framework}.html?case=${name}`);
        await expect(this.page.getByTestId('before')).toBeVisible();
        this.metadata = await this.page.evaluate(
            (key) => (window as unknown as Record<string, MenuProbe<unknown, string>>)[key].reference,
            this.probeKey
        );
        await this.checkpoint('initial');
    }
    async checkpoint(name: string, expected: Record<string, unknown> = {}) {
        const state = await this.page.evaluate(async (key) => {
            const probe = (window as unknown as Record<string, MenuProbe<unknown, string>>)[key];
            const read = () => {
                const bar = document.querySelector<HTMLElement>('[role="menubar"]');
                const popups = [...document.querySelectorAll<HTMLElement>('[data-menu-popup]')];
                const triggers = [...document.querySelectorAll<HTMLElement>('[data-menu-trigger]')];
                return {
                    ...(bar
                        ? {
                              bar: {
                                  orientation: bar.getAttribute('aria-orientation'),
                                  hasSubmenuOpen: bar.hasAttribute('data-has-submenu-open')
                              }
                          }
                        : {}),
                    open: popups.filter((el) => el.hasAttribute('data-open')).map((el) => el.dataset.menuPopup),
                    mounted: popups.map((el) => el.dataset.menuPopup),
                    visible: popups
                        .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden')
                        .map((el) => el.dataset.menuPopup),
                    roles: popups.map((el) => el.getAttribute('role')),
                    labelled: popups.map(
                        (el) =>
                            !!el
                                .getAttribute('aria-labelledby')
                                ?.split(/\s+/)
                                .every((id) => document.getElementById(id)?.textContent?.trim())
                    ),
                    triggers: triggers.map((el) => ({
                        id: el.dataset.testid,
                        expanded: el.getAttribute('aria-expanded'),
                        disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
                        tabIndex: el.tabIndex,
                        controlsLinked:
                            !!el.getAttribute('aria-controls') &&
                            !!document.getElementById(el.getAttribute('aria-controls')!)
                    })),
                    focus:
                        document.activeElement === document.body
                            ? 'body'
                            : (document.activeElement?.getAttribute('data-testid') ?? 'other'),
                    highlighted: [...document.querySelectorAll<HTMLElement>('[data-highlighted]')].map(
                        (el) => el.dataset.testid
                    ),
                    changes: probe.changes,
                    completions: probe.completions,
                    selected: probe.selected,
                    activations: probe.activations
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
            throw new Error('Menu family did not settle');
        }, this.probeKey);
        this.checkpoints.push({ name, state });
        expect(state, `${this.framework}: ${name}`).toEqual(expect.objectContaining(expected));
        expect(this.errors).toEqual([]);
    }
}
