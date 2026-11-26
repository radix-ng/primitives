import { expect, test, type Page } from '@playwright/test';
import { pauseClockBeforeInteraction } from '../../../../../tools/playwright/clock';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import {
    groupTimeout,
    hoverCloseDelay,
    hoverDelay,
    triggerHoverCloseDelay,
    triggerHoverDelay,
    updatedHoverCloseDelay,
    updatedHoverDelay,
    type OpenRequest
} from '../src/contract.ts';

type TriggerName = 'Copy' | 'Paste';

class TooltipDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['tooltipParity'];
    private readonly requests: Record<TriggerName, OpenRequest[]> = { Copy: [], Paste: [] };

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get trigger() {
        return this.getTrigger('Copy');
    }

    async goto(name: string): Promise<void> {
        const params = new URLSearchParams();
        if (name.startsWith('controlled-') || name === 'delayed-controlled-hover' || name === 'canceled-focus') {
            params.set('open', 'false');
        }
        if (name === 'controlled-overrides-default' || name === 'initial-default') params.set('defaultOpen', 'true');
        if (
            name.startsWith('provider-') ||
            ['reactive-disabled', 'disable-pending-hover', 'focus-loss-and-reentry'].includes(name)
        ) {
            params.set('interactions', 'true');
        }
        await this.page.goto(`/${this.framework}.html?${params}`);
        await expect(this.trigger).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.tooltipParity);
    }

    async set(name: string): Promise<void> {
        // A parent update should not move the pointer or blur the trigger.
        await this.page
            .getByRole('button', { name, exact: true })
            .evaluate((button: HTMLButtonElement) => button.click());
    }

    async startClock(): Promise<void> {
        await this.page.clock.install();
        await pauseClockBeforeInteraction(this.page);
    }

    async move(name?: TriggerName): Promise<void> {
        if (!name) {
            await this.page.mouse.move(550, 200);
            return;
        }
        const bounds = (await this.getTrigger(name).boundingBox())!;
        await this.page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    }

    async record(
        name: string,
        open: boolean | Record<TooltipDriver['framework'], boolean>,
        request?: OpenRequest | OpenRequest[],
        part: TriggerName = 'Copy',
        disabled = false
    ): Promise<void> {
        if (request) this.requests[part].push(...(Array.isArray(request) ? request : [request]));
        const read = () =>
            this.getTrigger(part).evaluate((trigger, part) => {
                const popup = document.querySelector(`[data-popup="${part}"]`);
                const description = trigger.getAttribute('aria-describedby');
                const log = document.querySelector(`[data-requests="${part}"]`)!.textContent;
                return {
                    popup: popup === null ? 'unmounted' : popup.hasAttribute('data-open') ? 'open' : 'closed',
                    accessibility: {
                        role: popup?.getAttribute('role') ?? null,
                        description: description === null ? 'absent' : popup?.id === description ? 'linked' : 'invalid'
                    },
                    triggerDisabled: trigger.hasAttribute('data-trigger-disabled'),
                    triggerOpen: trigger.hasAttribute('data-popup-open'),
                    requests: JSON.parse(log)
                };
            }, part);

        const expectedOpen = typeof open === 'boolean' ? open : open[this.framework];
        await expect.poll(read, name).toMatchObject({
            popup: expectedOpen ? 'open' : 'unmounted',
            triggerDisabled: disabled,
            ...(disabled && this.framework === 'react' ? {} : { triggerOpen: expectedOpen }),
            requests: this.requests[part].slice()
        });
        this.checkpoints.push({ name, state: await read() });
    }

    private getTrigger(name: TriggerName) {
        return this.page.getByRole('button', { name, exact: true });
    }
}

const hoverOpen = { open: true, reason: 'trigger-hover', canceled: false };
const hoverClose = { open: false, reason: 'trigger-hover', canceled: false };
const focusOpen = { open: true, reason: 'trigger-focus', canceled: false };
const focusClose = { open: false, reason: 'trigger-focus', canceled: false };

const scenarios = [
    {
        name: 'controlled-overrides-default',
        async run(driver: TooltipDriver) {
            await driver.record('controlled false overrides a true default', false);
            await driver.set('Set open');
            await driver.record('parent opens without a request', true);
            await driver.set('Set closed');
            await driver.record('parent closes without a request', false);
            await driver.set('Release open');
            await driver.record('release controlled binding', { angular: true, react: false });
        }
    },
    {
        name: 'initial-default',
        async run(driver: TooltipDriver) {
            await driver.record('an uncontrolled tooltip starts open', true);
            await driver.trigger.click();
            await driver.record('uncontrolled close is applied', false, {
                open: false,
                reason: 'trigger-press',
                canceled: false
            });
        }
    },
    {
        name: 'late-default',
        async run(driver: TooltipDriver) {
            await driver.record('an uncontrolled tooltip starts closed', false);
            await driver.set('Set default open');
            await driver.record('a late default leaves it closed', false);
        }
    },
    {
        name: 'delayed-controlled-hover',
        async run(driver: TooltipDriver) {
            const { page } = driver;
            await page.clock.install();
            const trigger = (await driver.trigger.boundingBox())!;
            await pauseClockBeforeInteraction(page);
            await page.mouse.move(trigger.x + trigger.width / 2, trigger.y + trigger.height / 2);
            await page.clock.runFor(hoverDelay / 2);
            await driver.record('hover has not reached the delay', false);
            await page.clock.runFor(hoverDelay);
            await driver.record('ignored hover request leaves the popup closed', false, {
                open: true,
                reason: 'trigger-hover',
                canceled: false
            });
            await page.clock.runFor(hoverDelay);
            await driver.set('Set open');
            await page.clock.runFor(32);
            await driver.record('parent accepts the hover request later', true);
        }
    },
    {
        name: 'canceled-focus',
        async run(driver: TooltipDriver) {
            await driver.set('Cancel next request');
            await driver.trigger.focus();
            await expect(driver.trigger).toBeFocused();
            await driver.record('canceled focus request leaves the popup closed', false, {
                open: true,
                reason: 'trigger-focus',
                canceled: true
            });
        }
    },
    {
        name: 'controlled-focus-and-dismissal',
        async run(driver: TooltipDriver) {
            await driver.trigger.focus();
            await expect(driver.trigger).toBeFocused();
            await driver.record('ignored focus request leaves the popup closed', false, {
                open: true,
                reason: 'trigger-focus',
                canceled: false
            });
            await driver.set('Set open');
            await driver.record('parent accepts the focus request', true);
            await driver.set('Cancel next request');
            await driver.page.keyboard.press('Escape');
            await driver.record('canceled Escape leaves the popup open', true, {
                open: false,
                reason: 'escape-key',
                canceled: true
            });
            await driver.page.keyboard.press('Escape');
            await driver.record('ignored Escape request leaves the popup open', true, {
                open: false,
                reason: 'escape-key',
                canceled: false
            });
            await driver.set('Set closed');
            await driver.record('parent accepts the dismissal', false);
        }
    },
    {
        name: 'provider-live-delays',
        async run(driver: TooltipDriver) {
            const { clock } = driver.page;
            await driver.startClock();
            await driver.set('Update provider delays');
            await clock.runFor(32);
            await driver.move('Copy');
            await clock.runFor(hoverDelay + 40);
            await driver.record('updated provider open delay is still pending', false);
            await clock.runFor(updatedHoverDelay - hoverDelay);
            await driver.record('updated provider open delay elapsed', true, hoverOpen);

            await driver.move();
            await clock.runFor(hoverCloseDelay + 40);
            await driver.record('updated provider close delay is still pending', true);
            await clock.runFor(updatedHoverCloseDelay - hoverCloseDelay + 16);
            await driver.record('updated provider close delay elapsed', false, hoverClose);

            await driver.set('End instant window');
            await clock.runFor(32);
            await driver.move('Paste');
            await clock.runFor(triggerHoverDelay / 2);
            await driver.record('trigger override is still pending', false, undefined, 'Paste');
            await clock.runFor(triggerHoverDelay);
            await driver.record('trigger open delay overrides provider', true, hoverOpen, 'Paste');

            await driver.move();
            await clock.runFor(updatedHoverCloseDelay + groupTimeout + 32);
            await driver.move('Copy');
            await clock.runFor(updatedHoverDelay + 32);
            await driver.record('tooltip reopens after provider delay', true, hoverOpen);
            await driver.set('Override close delay');
            await clock.runFor(32);
            await driver.move();
            await clock.runFor(triggerHoverCloseDelay / 2);
            await driver.record('live trigger close delay is still pending', true);
            await clock.runFor(triggerHoverCloseDelay);
            await driver.record('live trigger close delay overrides provider', false, hoverClose);
        }
    },
    {
        name: 'provider-sibling-handoff',
        async run(driver: TooltipDriver) {
            const { clock } = driver.page;
            await driver.startClock();
            await driver.move('Copy');
            await clock.runFor(hoverDelay + 32);
            await driver.record('first tooltip opens after the group delay', true, hoverOpen);
            await driver.move();
            await clock.runFor(32);
            await driver.record('first tooltip is still open during its close delay', true);

            await driver.move('Paste');
            await clock.runFor(32);
            await driver.record('second tooltip opens during the close delay', true, hoverOpen, 'Paste');
            await driver.record('second tooltip closes the first', false, {
                open: false,
                reason: 'none',
                canceled: false
            });

            await clock.runFor(hoverCloseDelay + groupTimeout);
            await driver.record('second tooltip keeps ownership while open', true, undefined, 'Paste');
            await driver.move();
            await clock.runFor(hoverCloseDelay + 16);
            await driver.record('second tooltip closes on pointer leave', false, hoverClose, 'Paste');
            await driver.move('Copy');
            await clock.runFor(32);
            await driver.record('first tooltip reopens within the instant window', true, hoverOpen);

            await driver.move();
            await clock.runFor(hoverCloseDelay + groupTimeout + 32);
            await driver.record('first tooltip closes and the group window expires', false, hoverClose);
            await driver.move('Copy');
            await clock.runFor(32);
            await driver.record('hover waits again after the group timeout', false);
            await clock.runFor(hoverDelay);
            await driver.record('first tooltip opens after the restored delay', true, hoverOpen);
        }
    },
    {
        name: 'disable-pending-hover',
        async run(driver: TooltipDriver) {
            const { clock } = driver.page;
            await driver.startClock();
            await driver.move('Copy');
            await clock.runFor(hoverDelay / 2);
            await driver.set('Disable root');
            await clock.runFor(32);
            await driver.record('root is disabled before the hover delay elapses', false, undefined, 'Copy', true);
            await clock.runFor(hoverDelay);
            const lateRequests =
                driver.framework === 'react' ? [hoverOpen, { open: false, reason: 'disabled', canceled: false }] : [];
            await driver.record('pending hover never displays the disabled tooltip', false, lateRequests, 'Copy', true);
            await driver.set('Enable root');
            await clock.runFor(hoverDelay);
            await driver.record('re-enabling leaves the tooltip closed', false);
        }
    },
    {
        name: 'reactive-disabled',
        async run(driver: TooltipDriver) {
            const { clock } = driver.page;
            await driver.startClock();
            await driver.move('Copy');
            await clock.runFor(hoverDelay + 32);
            await driver.record('an enabled tooltip opens on hover again', true, hoverOpen);
            await driver.set('Cancel next request');
            await driver.set('Disable root');
            await clock.runFor(32);
            await driver.record(
                'disabling hides after a canceled close',
                false,
                {
                    open: false,
                    reason: 'disabled',
                    canceled: true
                },
                'Copy',
                true
            );
            await driver.set('Enable root');
            await clock.runFor(32);
            await driver.record('re-enabling restores the retained open state', true);
            await driver.set('Disable root');
            await clock.runFor(32);
            await driver.record(
                'accepted disabled close clears the open state',
                false,
                {
                    open: false,
                    reason: 'disabled',
                    canceled: false
                },
                'Copy',
                true
            );
            await driver.set('Enable root');
            await clock.runFor(32);
            await driver.record('the tooltip stays closed after an accepted close', false);
        }
    },
    {
        name: 'focus-loss-and-reentry',
        async run(driver: TooltipDriver) {
            const { page } = driver;
            await driver.startClock();
            const outside = page.getByRole('textbox', { name: 'Outside' });
            await driver.trigger.focus();
            await page.clock.runFor(32);
            await driver.record('focus opens despite the provider hover delay', true, focusOpen);
            await outside.focus();
            await expect(outside).toBeFocused();
            await page.clock.runFor(32);
            await driver.record('blur closes before the hover close delay', false, focusClose);
            await driver.trigger.focus();
            await page.clock.runFor(32);
            await driver.record('returning focus reopens the tooltip', true, focusOpen);
        }
    }
];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new TooltipDriver(page, framework),
    readNativeEvents: (driver) => {
        expect(driver.errors).toEqual([]);
        return Promise.resolve([]);
    }
});

for (const scenario of scenarios) {
    test(scenario.name, ({ browser, baseURL }, info) => run(scenario, { browser, baseURL }, info));
}
