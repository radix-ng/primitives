import { expect, test, type Page } from '@playwright/test';
import { pauseClockBeforeInteraction } from '../../../../../tools/playwright/clock';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { hoverDelay, type OpenRequest } from '../src/contract.ts';

class TooltipDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['tooltipParity'];
    private requests: OpenRequest[] = [];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get trigger() {
        return this.page.getByRole('button', { name: 'Copy', exact: true });
    }

    async goto(name: string): Promise<void> {
        const params = new URLSearchParams();
        if (name !== 'initial-default' && name !== 'late-default') params.set('open', 'false');
        if (name === 'controlled-overrides-default' || name === 'initial-default') params.set('defaultOpen', 'true');
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

    async record(name: string, open: boolean | Record<TooltipDriver['framework'], boolean>, request?: OpenRequest) {
        if (request) this.requests.push(request);
        const read = () =>
            this.trigger.evaluate((trigger) => {
                const popup = document.querySelector('[data-popup]');
                const description = trigger.getAttribute('aria-describedby');
                const log = document.querySelector('[data-requests]')!.textContent;
                return {
                    popup: popup === null ? 'unmounted' : popup.hasAttribute('data-open') ? 'open' : 'closed',
                    accessibility: {
                        role: popup?.getAttribute('role') ?? null,
                        description: description === null ? 'absent' : popup?.id === description ? 'linked' : 'invalid'
                    },
                    triggerOpen: trigger.hasAttribute('data-popup-open'),
                    requests: JSON.parse(log)
                };
            });

        const expectedOpen = typeof open === 'boolean' ? open : open[this.framework];
        await expect.poll(read, name).toMatchObject({
            popup: expectedOpen ? 'open' : 'unmounted',
            triggerOpen: expectedOpen,
            requests: this.requests.slice()
        });
        this.checkpoints.push({ name, state: await read() });
    }
}

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
