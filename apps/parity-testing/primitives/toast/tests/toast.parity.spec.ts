import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { providerTimeout, resetTimeout, type ToastEvent } from '../src/contract.ts';

const removed = (id: string): ToastEvent[] => [
    { id, phase: 'close' },
    { id, phase: 'remove' }
];

class ToastDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['toastParity']['reference'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get viewport() {
        return this.page.getByRole('region', { name: 'Notifications' });
    }

    async goto(name: string) {
        await this.page.bringToFront();
        if (name.startsWith('timer-')) {
            await this.page.clock.install({ time: 0 });
            await this.page.clock.pauseAt(1000);
        }

        await this.page.goto('/' + this.framework + '.html');
        await expect(this.viewport).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.toastParity.reference);
    }

    action(name: string) {
        return this.page.getByRole('button', { name, exact: true }).click();
    }

    async addNotices(count: number) {
        for (let index = 0; index < count; index++) await this.action('Add notification');
    }

    async checkpoint<T extends object>(name: string, read: () => Promise<T>, expected: T) {
        await expect.poll(read, name).toEqual(expected);
        this.checkpoints.push({ name, state: await read() });
    }

    async queue(name: string, visible: number[], limited: number[], events: ToastEvent[] = []) {
        await this.checkpoint(
            name,
            () =>
                this.viewport.evaluate((viewport) => ({
                    toasts: [...viewport.querySelectorAll<HTMLElement>('[data-toast]')]
                        .map((root) => ({
                            id: root.dataset.testid,
                            limited: root.hasAttribute('data-limited'),
                            inert: root.inert,
                            displayed: getComputedStyle(root).display !== 'none',
                            index: root.hasAttribute('data-limited')
                                ? null
                                : Number(root.style.getPropertyValue('--toast-index'))
                        }))
                        .sort((a, b) => (a.id ?? '').localeCompare(b.id ?? '')),
                    events: window.toastParity.events
                })),
            {
                toasts: [
                    ...visible.map((id, index) => ({
                        id: 'notice-' + id,
                        limited: false,
                        inert: false,
                        displayed: true,
                        index
                    })),
                    ...limited.map((id) => ({
                        id: 'notice-' + id,
                        limited: true,
                        inert: true,
                        displayed: false,
                        index: null
                    }))
                ].sort((a, b) => a.id.localeCompare(b.id)),
                events
            }
        );
    }

    async domOrder() {
        this.checkpoints.push({
            name: 'native queue order',
            state: {
                order: await this.viewport
                    .locator('[data-toast]')
                    .evaluateAll((roots) => roots.map((root) => root.getAttribute('data-testid')))
            }
        });
    }

    async timed(name: string, toast: { id: string; title: string; type?: string } | null, events: ToastEvent[] = []) {
        await this.checkpoint(
            name,
            () =>
                this.viewport.evaluate((viewport) => ({
                    toasts: [...viewport.querySelectorAll<HTMLElement>('[data-toast]')].map((root) => ({
                        id: root.dataset.testid,
                        title: root.querySelector('[data-title]')?.textContent?.trim(),
                        type: root.getAttribute('data-type')
                    })),
                    events: window.toastParity.events
                })),
            {
                toasts: toast ? [{ id: toast.id, title: toast.title, type: toast.type ?? null }] : [],
                events
            }
        );
    }

    async focus(name: string, id: string, expanded: boolean) {
        await expect(this.page.getByTestId(id)).toBeFocused();
        await this.checkpoint(
            name,
            () =>
                this.viewport.evaluate((viewport) => ({
                    focus: (viewport.ownerDocument.activeElement as HTMLElement | null)?.dataset.testid,
                    expanded: viewport.hasAttribute('data-expanded'),
                    inPortal: !viewport.closest('[data-testid="fixture"]'),
                    label: viewport.getAttribute('aria-label'),
                    live: viewport.getAttribute('aria-live')
                })),
            { focus: id, expanded, inPortal: true, label: 'Notifications', live: 'polite' }
        );
    }
}

const timed = { id: 'timed', title: 'Timed' };
const saved = { id: 'save', title: 'Saved', type: 'success' };

const scenarios: { name: string; run(driver: ToastDriver): Promise<void> }[] = [
    {
        name: 'queue-overflow',
        async run(driver) {
            await driver.addNotices(4);
            await driver.queue('oldest retained outside the visible stack', [4, 3, 2], [1]);
            await driver.domOrder();

            await driver.page.getByTestId('dismiss-notice-4').click();
            await driver.queue('oldest promoted after dismissal', [3, 2, 1], [], removed('notice-4'));
        }
    },
    {
        name: 'queue-live-limit',
        async run(driver) {
            await driver.addNotices(3);
            await driver.action('Limit to one');
            await driver.queue('lowering the limit keeps the pending toasts mounted', [3], [1, 2]);
            await driver.action('Limit to three');
            await driver.queue('raising the limit restores both without dismissal callbacks', [3, 2, 1], []);
        }
    },
    {
        name: 'timer-copy-update',
        async run(driver) {
            const clock = driver.page.clock;
            await driver.action('Add timed notification');
            await clock.runFor(providerTimeout - 250);
            await driver.timed('still present before the provider timeout', timed);
            await driver.action('Update copy');
            await clock.runFor(100);
            await driver.timed('updated copy stays on the same toast', { ...timed, title: 'Updated' });
            await clock.runFor(200);
            await driver.timed('dismissed at the original deadline', null, removed('timed'));
        }
    },
    {
        name: 'timer-explicit-reset',
        async run(driver) {
            const clock = driver.page.clock;
            await driver.action('Add timed notification');
            await clock.runFor(providerTimeout - 250);
            await driver.action('Reset timer');
            await clock.runFor(resetTimeout - 100);
            await driver.timed('still present past the original deadline', timed);
            await clock.runFor(200);
            await driver.timed('dismissed at the replacement deadline', null, removed('timed'));
        }
    },
    {
        name: 'timer-hover-and-focus',
        async run(driver) {
            const { keyboard, mouse, clock } = driver.page;
            await driver.action('Add timed notification');
            await clock.runFor(350);
            await driver.page.getByTestId('timed').hover();
            await clock.runFor(providerTimeout);
            await driver.timed('hover pauses the timer', timed);

            await driver.page.getByTestId('origin').focus();
            await keyboard.press('F6');
            await mouse.move(8, 250);
            await clock.runFor(providerTimeout);
            await driver.focus('leaving hover keeps keyboard focus', 'viewport', true);
            await driver.timed('keyboard focus keeps the timer paused', timed);

            await keyboard.press('F6');
            await clock.runFor(300);
            await driver.focus('leaving the viewport restores focus', 'origin', false);
            await driver.timed('the remaining time is preserved', timed);
            await clock.runFor(500);
            await driver.timed('the resumed timer dismisses the toast', null, removed('timed'));
        }
    },
    {
        name: 'timer-promise-default',
        async run(driver) {
            const clock = driver.page.clock;
            await driver.action('Start save');
            await clock.runFor(providerTimeout * 2);
            await driver.timed('pending promise has no dismissal timer', {
                id: 'save',
                title: 'Saving',
                type: 'loading'
            });
            await driver.action('Finish save');
            await clock.runFor(providerTimeout - 100);
            await driver.timed('resolved content uses the provider timeout', saved);
            await clock.runFor(200);
            await driver.timed('provider timeout dismisses the result', null, removed('save'));
        }
    },
    {
        name: 'timer-promise-persistent',
        async run(driver) {
            const clock = driver.page.clock;
            await driver.action('Start persistent save');
            await clock.runFor(100);
            await driver.action('Finish save');
            await clock.runFor(providerTimeout * 6);
            await driver.timed('explicit zero keeps the promise result mounted', saved);
        }
    },
    {
        name: 'portal-keyboard-restore',
        async run(driver) {
            const { keyboard } = driver.page;
            await driver.addNotices(1);
            await driver.page.getByTestId('origin').focus();

            await keyboard.press('F6');
            await driver.focus('F6 enters the portaled region', 'viewport', true);
            await keyboard.press('Shift+Tab');
            await driver.focus('Shift+Tab restores the origin', 'origin', false);

            await keyboard.press('F6');
            await keyboard.press('Tab');
            await driver.focus('Tab enters the notification dialog', 'notice-1', true);
            await keyboard.press('Tab');
            await driver.focus('Tab reaches the native close button', 'dismiss-notice-1', true);
            await keyboard.press('Tab');
            await driver.focus('Tab after the last control restores the origin', 'origin', false);

            await keyboard.press('F6');
            await keyboard.press('Tab');
            await keyboard.press('Escape');
            await driver.focus('dismissing the last toast restores the origin', 'origin', false);
            await driver.queue('Escape removes the focused toast', [], [], removed('notice-1'));
        }
    },
    {
        name: 'portal-focus-next',
        async run(driver) {
            const { keyboard } = driver.page;
            await driver.addNotices(2);
            await driver.page.getByTestId('origin').focus();
            await keyboard.press('F6');
            await driver.focus('F6 enters a stack of two toasts', 'viewport', true);

            await driver.page.getByTestId('notice-2').focus();
            await keyboard.press('Escape');
            await driver.focus('closing the newest gives focus to the remaining toast', 'notice-1', true);
            await driver.queue('focus recovery leaves the remaining toast open', [1], [], removed('notice-2'));

            await keyboard.press('Escape');
            await driver.focus('closing the remaining toast restores the origin', 'origin', false);
            await driver.queue('both toasts dismissed once', [], [], [...removed('notice-2'), ...removed('notice-1')]);
        }
    }
];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new ToastDriver(page, framework),
    readNativeEvents: () => Promise.resolve([]),
    pageOptions: () => ({ reducedMotion: 'reduce' })
});

for (const scenario of scenarios) {
    test(scenario.name, async ({ browser, baseURL }, info) => run(scenario, { browser, baseURL }, info));
}
