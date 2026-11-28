import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { providerTimeout, requestId, resetTimeout, type RequestSettlement, type ToastEvent } from '../src/contract.ts';

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

        await this.page.goto('/' + this.framework + '.html' + (name.startsWith('request-') ? '?requests' : ''));
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

    async singleToast(
        name: string,
        toast: { id: string; title: string; type?: string; ending?: boolean } | null,
        events: ToastEvent[] = [],
        settlements: RequestSettlement[] = []
    ) {
        await this.checkpoint(
            name,
            () =>
                this.viewport.evaluate((viewport) => ({
                    toasts: [...viewport.querySelectorAll<HTMLElement>('[data-toast]')].map((root) => ({
                        id: root.dataset.testid,
                        title: root.querySelector('[data-title]')?.textContent?.trim(),
                        type: root.getAttribute('data-type'),
                        ending: root.hasAttribute('data-ending-style')
                    })),
                    events: window.toastParity.events,
                    settlements: window.toastParity.settlements
                })),
            {
                toasts: toast
                    ? [{ id: toast.id, title: toast.title, type: toast.type ?? null, ending: toast.ending ?? false }]
                    : [],
                events,
                settlements
            }
        );
    }

    async dismissRequest() {
        await this.page.getByTestId('dismiss-' + requestId).click();
        await expect
            .poll(() =>
                this.page
                    .getByTestId(requestId)
                    .evaluate((root) => root.getAnimations().some((animation) => animation.playState === 'paused'))
            )
            .toBe(true);
    }

    async finishRequestExit() {
        await this.page.getByTestId(requestId).evaluate((root) => {
            for (const animation of root.getAnimations()) animation.finish();
        });
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
const firstLoading = { id: requestId, title: 'Saving first', type: 'loading' };
const secondLoading = { id: requestId, title: 'Saving second', type: 'loading' };
const firstExit = { ...firstLoading, ending: true };
const firstSaved = { id: requestId, title: 'Saved first', type: 'success' };
const secondSaved = { id: requestId, title: 'Saved second', type: 'success' };
const firstFailed = { id: requestId, title: 'Failed first', type: 'error' };
const firstClose = { id: requestId, owner: 'first', phase: 'close' } as const;
const secondClose = { id: requestId, owner: 'second', phase: 'close' } as const;
const firstRemove = { ...firstClose, phase: 'remove' } as const;
const secondRemove = { ...secondClose, phase: 'remove' } as const;
const firstFulfilled = { owner: 'first', outcome: 'fulfilled' } as const;
const secondFulfilled = { owner: 'second', outcome: 'fulfilled' } as const;
const firstRejected = { owner: 'first', outcome: 'rejected' } as const;

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
            await driver.singleToast('still present before the provider timeout', timed);
            await driver.action('Update copy');
            await clock.runFor(100);
            await driver.singleToast('updated copy stays on the same toast', { ...timed, title: 'Updated' });
            await clock.runFor(200);
            await driver.singleToast('dismissed at the original deadline', null, removed('timed'));
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
            await driver.singleToast('still present past the original deadline', timed);
            await clock.runFor(200);
            await driver.singleToast('dismissed at the replacement deadline', null, removed('timed'));
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
            await driver.singleToast('hover pauses the timer', timed);

            await driver.page.getByTestId('origin').focus();
            await keyboard.press('F6');
            await mouse.move(8, 250);
            await clock.runFor(providerTimeout);
            await driver.focus('leaving hover keeps keyboard focus', 'viewport', true);
            await driver.singleToast('keyboard focus keeps the timer paused', timed);

            await keyboard.press('F6');
            await clock.runFor(300);
            await driver.focus('leaving the viewport restores focus', 'origin', false);
            await driver.singleToast('the remaining time is preserved', timed);
            await clock.runFor(500);
            await driver.singleToast('the resumed timer dismisses the toast', null, removed('timed'));
        }
    },
    {
        name: 'timer-promise-default',
        async run(driver) {
            const clock = driver.page.clock;
            await driver.action('Start save');
            await clock.runFor(providerTimeout * 2);
            await driver.singleToast('pending promise has no dismissal timer', {
                id: 'save',
                title: 'Saving',
                type: 'loading'
            });
            await driver.action('Finish save');
            await clock.runFor(providerTimeout - 100);
            await driver.singleToast('resolved content uses the provider timeout', saved);
            await clock.runFor(200);
            await driver.singleToast('provider timeout dismisses the result', null, removed('save'));
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
            await driver.singleToast('explicit zero keeps the promise result mounted', saved);
        }
    },
    {
        name: 'request-shared-id-settlement-order',
        async run(driver) {
            await driver.action('Start first request');
            await driver.singleToast('first request creates the loading toast', firstLoading);
            await driver.action('Start second request');
            await driver.singleToast('second request upserts the same ID', secondLoading);
            await driver.action('Resolve second request');
            await driver.singleToast('second result reaches the shared toast', secondSaved, [], [secondFulfilled]);
            await driver.action('Reject first request');
            const results = [secondFulfilled, firstRejected];
            await driver.singleToast('last settlement updates the active ID', firstFailed, [], results);
            await driver.dismissRequest();
            await driver.singleToast(
                'upsert owns the close callback',
                { ...firstFailed, ending: true },
                [secondClose],
                results
            );
            await driver.finishRequestExit();
            await driver.singleToast('upsert owns the remove callback', null, [secondClose, secondRemove], results);
        }
    },
    {
        name: 'request-settlement-during-exit',
        async run(driver) {
            await driver.action('Start first request');
            await driver.singleToast('pending request is visible', firstLoading);
            await driver.dismissRequest();
            await driver.singleToast('first dismissal starts a retained exit', firstExit, [firstClose]);
            await driver.action('Resolve first request');
            await driver.dismissRequest();
            await driver.singleToast(
                'settlement and repeated close leave the exit intact',
                firstExit,
                [firstClose],
                [firstFulfilled]
            );
            await driver.finishRequestExit();
            await driver.singleToast(
                'exit completes with one removal',
                null,
                [firstClose, firstRemove],
                [firstFulfilled]
            );
        }
    },
    {
        name: 'request-settlement-after-removal',
        async run(driver) {
            await driver.action('Start first request');
            await driver.singleToast('pending request is visible', firstLoading);
            await driver.dismissRequest();
            await driver.finishRequestExit();
            await driver.singleToast('dismissed while the request is pending', null, [firstClose, firstRemove]);
            await driver.action('Reject first request');
            await driver.singleToast(
                'rejection does not recreate the removed ID',
                null,
                [firstClose, firstRemove],
                [firstRejected]
            );
        }
    },
    {
        name: 'request-reuse-during-exit',
        async run(driver) {
            await driver.action('Start first request');
            await driver.singleToast('pending request is visible', firstLoading);
            await driver.dismissRequest();
            const root = driver.page.getByTestId(requestId);
            const outgoing = await root.elementHandle();
            try {
                await driver.action('Start second request');
                await driver.singleToast('replacement abandons the previous exit', secondLoading, [firstClose]);
                expect(await root.evaluate((element, previous) => element === previous, outgoing)).toBe(true);
                await expect.poll(() => root.evaluate((element) => element.getAnimations().length)).toBe(0);

                await driver.action('Resolve first request');
                await driver.singleToast(
                    'older result reaches the active replacement ID',
                    firstSaved,
                    [firstClose],
                    [firstFulfilled]
                );
                await driver.action('Resolve second request');
                const results = [firstFulfilled, secondFulfilled];
                await driver.singleToast(
                    'latest result reaches the same replacement',
                    secondSaved,
                    [firstClose],
                    results
                );
                await driver.dismissRequest();
                await driver.singleToast(
                    'replacement has its own exit',
                    { ...secondSaved, ending: true },
                    [firstClose, secondClose],
                    results
                );
                await driver.finishRequestExit();
                await driver.singleToast(
                    'only the completed exit fires onRemove',
                    null,
                    [firstClose, secondClose, secondRemove],
                    results
                );
            } finally {
                await outgoing.dispose();
            }
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
