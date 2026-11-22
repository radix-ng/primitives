import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import type { PressRequest } from '../src/contract.ts';

const click = (pressed: boolean, trusted = true, shiftKey = false): PressRequest => ({
    pressed,
    reason: 'none',
    eventType: 'click',
    originalClick: true,
    shiftKey,
    trusted
});

class ToggleDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['toggleParity']['reference'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get toggle() {
        return this.page.getByRole('button', { name: 'Bold' });
    }

    action(name: string) {
        return this.page.getByRole('button', { name, exact: true }).click();
    }

    async goto(name: string) {
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.toggle).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.toggleParity.reference);
    }

    async state(name: string, pressed: boolean, requests: PressRequest[]) {
        const read = () =>
            this.toggle.evaluate((button) => ({
                pressed: button.getAttribute('aria-pressed'),
                dataPressed: button.hasAttribute('data-pressed'),
                requests: window.toggleParity.requests
            }));
        await expect.poll(read, name).toEqual({ pressed: String(pressed), dataPressed: pressed, requests });
        this.checkpoints.push({ name, state: await read() });
    }

    async tabIntoToggle() {
        await this.page.getByRole('textbox', { name: 'Before' }).focus();
        await this.page.keyboard.press('Tab');
    }
}

const scenarios: { name: string; run(driver: ToggleDriver): Promise<void> }[] = [
    {
        name: 'default',
        async run(driver) {
            await driver.state('starts pressed without a request', true, []);
            await driver.action('Change default');
            await driver.state('late default leaves the original state', true, []);
            await driver.toggle.click();
            await driver.state('uncontrolled press is committed', false, [click(false)]);
            await driver.action('Change default');
            await driver.state('late default preserves an accepted edit', false, [click(false)]);
        }
    },
    {
        name: 'late-default',
        async run(driver) {
            await driver.state('starts off by default', false, []);
            await driver.action('Change default');
            await driver.state('first late true default leaves the state off', false, []);
        }
    },
    {
        name: 'controlled',
        async run(driver) {
            await driver.state('bound false wins over a true default', false, []);
            await driver.toggle.click();
            await driver.state('ignored request keeps the pressed value', false, [click(true)]);
            await driver.toggle.click();
            await driver.state('repeated request uses the supplied value', false, [click(true), click(true)]);
            await driver.action('Apply request');
            await driver.state('parent accepts the request later', true, [click(true), click(true)]);
            await driver.action('Set off');
            await driver.state('parent can replace the accepted value', false, [click(true), click(true)]);
        }
    },
    {
        name: 'canceled',
        async run(driver) {
            await driver.page.evaluate(() => {
                window.toggleParity.cancel = true;
            });
            await driver.toggle.click();
            await driver.state('veto leaves the toggle unpressed', false, [click(true)]);
            await driver.page.evaluate(() => {
                window.toggleParity.cancel = false;
            });
            await driver.toggle.click();
            await driver.state('accepted retry changes the toggle once', true, [click(true), click(true)]);
        }
    },
    ...['native-activation', 'custom-activation'].map((name) => ({
        name,
        async run(driver: ToggleDriver) {
            const native = name === 'native-activation';
            const keyboard = driver.page.keyboard;
            await driver.tabIntoToggle();
            await expect(driver.toggle).toBeFocused();

            await keyboard.down('Enter');
            await driver.state('Enter activates on keydown', true, [click(true, native)]);
            await keyboard.up('Enter');
            await driver.state('Enter release leaves the change intact', true, [click(true, native)]);

            if (!native) await keyboard.down('Shift');
            await keyboard.down('Space');
            await driver.state('standalone Space waits for keyup', true, [click(true, native)]);
            await keyboard.up('Space');
            if (!native) await keyboard.up('Shift');
            const requests = [click(true, native), click(false, native, !native)];
            await driver.state('Space releases through one DOM click', false, requests);

            await driver.toggle.evaluate((element) =>
                element.addEventListener('keyup', (event) => event.preventDefault(), { once: true })
            );
            await keyboard.press('Space');
            await driver.state('preventing keyup vetoes Space activation', false, requests);
        }
    })),
    {
        name: 'custom-disabled',
        async run(driver) {
            await expect(driver.toggle).toBeDisabled();
            await expect(driver.toggle).toHaveAttribute('tabindex', '-1');
            await driver.tabIntoToggle();
            await expect(driver.page.getByRole('textbox', { name: 'After' })).toBeFocused();
            await driver.toggle.focus();
            await expect(driver.toggle).toBeFocused();
            await driver.page.keyboard.press('Enter');
            await driver.page.keyboard.press('Space');
            await driver.toggle.dispatchEvent('click');
            await driver.state('the disabled host ignores keyboard and click', false, []);
        }
    }
];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new ToggleDriver(page, framework),
    readNativeEvents: () => Promise.resolve([])
});

for (const scenario of scenarios) {
    test(scenario.name, async ({ browser, baseURL }, info) =>
        run(
            {
                ...scenario,
                async run(driver) {
                    await scenario.run(driver);
                    expect(driver.errors).toEqual([]);
                }
            },
            { browser, baseURL },
            info
        )
    );
}
