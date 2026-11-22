import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import type { Change } from '../src/contract.ts';

const change = (checked: boolean, shiftKey = false): Change => ({
    checked,
    reason: 'none',
    eventType: 'click',
    shiftKey
});

class SwitchDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['switchParity']['reference'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get root() {
        return this.page.getByRole('switch', { name: 'Alerts' });
    }

    get input() {
        return this.page.locator('input[type=checkbox]');
    }

    get form() {
        return this.page.locator('#preferences');
    }

    async goto(name: string) {
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.root).toHaveCount(1);
        await expect(this.input).toHaveCount(1);
        this.metadata = await this.page.evaluate(() => window.switchParity.reference);
    }

    async state(name: string, checked: boolean, changes: Change[]) {
        const read = () =>
            this.page.evaluate(() => {
                const root = document.querySelector('[role=switch]')!;
                const thumb = document.querySelector('[data-testid=thumb]')!;
                const input = document.querySelector<HTMLInputElement>('input[type=checkbox]')!;
                const form = document.querySelector<HTMLFormElement>('#preferences')!;
                const flags = (element: Element) =>
                    ['data-checked', 'data-unchecked', 'data-disabled', 'data-readonly', 'data-required'].filter(
                        (name) => element.hasAttribute(name)
                    );
                return {
                    checked: root.getAttribute('aria-checked') === 'true',
                    root: flags(root),
                    thumb: flags(thumb),
                    native: input.checked,
                    values: new FormData(form).getAll('alerts'),
                    changes: window.switchParity.changes
                };
            });
        const flag = checked ? 'data-checked' : 'data-unchecked';
        await expect.poll(read, name).toMatchObject({
            checked,
            native: checked,
            values: (await this.root.isDisabled()) ? [] : [checked ? 'yes' : 'no'],
            changes
        });
        const state = await read();
        expect(state.root[0]).toBe(flag);
        expect(state.thumb).toEqual(state.root);
        this.checkpoints.push({ name, state });
    }

    native() {
        return this.page.evaluate(() => window.switchParity.native);
    }

    async fieldState(name: string, attributes: string[], values: [string, string][]) {
        const read = () =>
            this.page.getByTestId('field').evaluate((field) => {
                const names = ['data-dirty', 'data-filled', 'data-focused', 'data-touched'];
                const flags = (element: Element) => names.filter((name) => element.hasAttribute(name));
                const parts = [
                    field,
                    field.querySelector('[role=switch]')!,
                    field.querySelector('[data-testid=thumb]')!
                ];
                return {
                    attributes: parts.map(flags),
                    values: [...new FormData(field.closest('form')!).entries()]
                };
            });
        await expect.poll(read, name).toEqual({ attributes: [attributes, attributes, attributes], values });
        this.checkpoints.push({ name, state: await read() });
    }
}

const scenarios: { name: string; run(driver: SwitchDriver): Promise<void> }[] = [
    {
        name: 'default',
        async run(driver) {
            await driver.state('initial on state', true, []);
            await driver.page.getByRole('button', { name: 'Change default' }).click();
            await driver.state('changed default leaves the initial state alone', true, []);
            await driver.root.press('Space');
            await driver.state('uncontrolled edit is accepted', false, [change(false)]);
            await expect.poll(() => driver.native()).toEqual(['input', 'change']);
        }
    },
    {
        name: 'late-default',
        async run(driver) {
            await driver.state('omitted default starts off', false, []);
            await driver.page.getByRole('button', { name: 'Change default' }).click();
            await driver.state('first late default leaves state off', false, []);
            expect(await driver.native()).toEqual([]);
        }
    },
    {
        name: 'controlled',
        async run(driver) {
            await driver.state('explicit false takes precedence over default', false, []);
            await driver.root.click();
            await driver.state('parent ignores request', false, [change(true)]);
            await driver.root.press('Space');
            await driver.state('repeated request still uses the parent value', false, [change(true), change(true)]);
            await driver.page.getByRole('button', { name: 'Apply request' }).click();
            await driver.state('delayed parent acceptance reaches native input', true, [change(true), change(true)]);
        }
    },
    ...['activation', 'authored'].map((name) => ({
        name,
        async run(driver: SwitchDriver) {
            const changes: Change[] = [];
            await expect(driver.root).toMatchAriaSnapshot('- switch "Alerts"');
            await expect(driver.input).toHaveAttribute('aria-hidden', 'true');
            await expect(driver.page.getByRole('checkbox')).toHaveCount(0);
            if (name === 'activation') await expect(driver.root.locator('input')).toHaveCount(0);
            await driver.state('ready to activate', false, changes);

            await driver.page.locator('label[for=alerts]').click();
            changes.push(change(true));
            await driver.state('label activates once', true, changes);

            await driver.root.press('Space');
            changes.push(change(false));
            await driver.state('Space activates once', false, changes);

            await driver.root.press('Enter');
            changes.push(change(true));
            await driver.state('Enter activates once', true, changes);

            await driver.root.click({ modifiers: ['Shift'] });
            changes.push(change(false, true));
            await driver.state('modifier reaches the request', false, changes);

            await driver.input.evaluate((input: HTMLInputElement) => input.click());
            changes.push(change(true));
            await driver.state('native checkbox activation reaches the same owner', true, changes);
            await expect
                .poll(() => driver.native())
                .toEqual(Array.from({ length: 5 }, () => ['input', 'change']).flat());
        }
    })),
    {
        name: 'canceled',
        async run(driver) {
            await driver.page.evaluate(() => {
                window.switchParity.cancelsChange = true;
            });
            await driver.root.click();
            await driver.state('veto keeps Switch off', false, [change(true)]);
            driver.checkpoints.push({
                name: 'native notifications after veto',
                state: { events: await driver.native() }
            });

            await driver.page.evaluate(() => {
                window.switchParity.cancelsChange = false;
            });
            await driver.root.click();
            await driver.state('accepted retry changes state once', true, [change(true), change(true)]);
        }
    },
    ...['disabled', 'readonly'].map((name) => ({
        name,
        async run(driver: SwitchDriver) {
            await driver.root.click({ force: true });
            await driver.root.press('Space');
            await driver.root.press('Enter');
            await driver.page.locator('label[for=alerts]').click({ force: name === 'disabled' });
            await driver.state('interaction keeps state off', false, []);
            if (name === 'disabled') await expect(driver.root).toBeDisabled();
            else {
                await driver.root.focus();
                await expect(driver.root).toBeFocused();
            }
            expect(await driver.native()).toEqual([]);
        }
    })),
    {
        name: 'external-form',
        async run(driver) {
            const { page } = driver;
            await expect(driver.root).toHaveAttribute('aria-required', 'true');
            expect(await driver.input.evaluate((input: HTMLInputElement) => input.form?.id)).toBe('preferences');
            expect(await driver.root.evaluate((button) => button.closest('form'))).toBeNull();
            await driver.state('external unchecked value', false, []);
            expect(await driver.form.evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(false);

            await page.locator('label[for=alerts]').click();
            await driver.state('external checked value', true, [change(true)]);
            await page.getByRole('button', { name: 'Save' }).click();
            await expect.poll(() => driver.native()).toEqual(['input', 'change', 'submit:save']);

            // Keep the browser's validation popup at the end of the pointer interactions.
            await driver.root.press('Space');
            await driver.state('required switch returns to off', false, [change(true), change(false)]);
            const invalidBefore = await page.evaluate(() => window.switchParity.invalid);
            await page.getByRole('button', { name: 'Save' }).click();
            await expect.poll(() => page.evaluate(() => window.switchParity.invalid)).toBe(invalidBefore + 1);
            await expect(driver.root).toBeFocused();
            expect(await driver.native()).toEqual(['input', 'change', 'submit:save', 'input', 'change']);
        }
    },
    {
        name: 'reset',
        async run(driver) {
            const { page } = driver;
            await driver.state('initial reset baseline', true, []);
            await driver.root.press('Space');
            await driver.state('edit before reset', false, [change(false)]);
            await page.getByRole('button', { name: 'Change default' }).click();
            await page.evaluate(() => {
                window.switchParity.cancelsReset = true;
            });
            await page.getByRole('button', { name: 'Reset' }).click();
            await driver.state('canceled reset preserves the edit', false, [change(false)]);

            await page.evaluate(() => {
                window.switchParity.cancelsReset = false;
            });
            await page.getByRole('button', { name: 'Reset' }).click();
            if (driver.framework === 'angular') await expect(driver.root).toBeChecked();
            const read = () =>
                page.evaluate(() => ({
                    checked: document.querySelector('[role=switch]')?.getAttribute('aria-checked'),
                    native: document.querySelector<HTMLInputElement>('input[type=checkbox]')?.checked,
                    values: new FormData(document.querySelector('form')!).getAll('alerts'),
                    changes: window.switchParity.changes
                }));
            driver.checkpoints.push({ name: 'accepted reset', state: await read() });
            expect(await driver.native()).toEqual(['input', 'change']);
        }
    },
    {
        name: 'field',
        async run(driver) {
            const { page } = driver;
            const button = page.locator('[role=switch]');
            const field = page.getByTestId('field');
            const label = page.locator('#field-label');
            await expect(label).toHaveAttribute('for', 'alerts');
            await expect(button).toHaveAttribute('aria-labelledby', 'field-label');
            await expect(button).toHaveAttribute('aria-describedby', 'additional-description field-description');
            await expect(driver.input).toHaveAttribute('name', 'alerts');
            await expect(field).toMatchAriaSnapshot(`- switch "Alerts"`);
            await expect(page.getByRole('checkbox')).toHaveCount(0);
            await expect(button).toHaveAccessibleDescription('Account settings. Sends email updates.');
            await driver.fieldState('Field starts empty', [], []);

            await button.focus();
            await driver.fieldState('Field shares switch focus', ['data-focused'], []);
            await page.getByRole('button', { name: 'Outside' }).focus();
            await driver.fieldState('blur marks Field and both Switch parts touched', ['data-touched'], []);
            await label.click();
            await expect(button).toBeChecked();
            await button.focus();
            await driver.fieldState(
                'native label fills the Field under its name',
                ['data-dirty', 'data-filled', 'data-focused', 'data-touched'],
                [['alerts', 'yes']]
            );
            await button.press('F2');
            await expect(button).toBeDisabled();
            await expect(driver.input).toBeDisabled();
            await expect(page.getByTestId('thumb')).toHaveAttribute('data-disabled', '');
            await driver.fieldState(
                'disabled Field releases focus and form value',
                ['data-dirty', 'data-filled', 'data-touched'],
                []
            );
            await page.getByRole('button', { name: 'Toggle Field disabled' }).click();
            await expect(button).toBeEnabled();

            await page.getByRole('button', { name: 'Set explicit name' }).click();
            await expect(label).toHaveAttribute('for', 'alerts-renamed');
            await expect(button).toHaveAccessibleName('Email notifications');
            await expect(button).not.toHaveAttribute('aria-labelledby');
            await page.getByRole('button', { name: 'Set label reference' }).click();
            await expect(button).toHaveAccessibleName('Notification preference');
            await expect(button).toHaveAttribute('aria-labelledby', 'external-label');

            await button.focus();
            await expect(field).toHaveAttribute('data-focused', '');
            await button.press('F3');
            await expect(button).toHaveCount(0);
            await expect(field).not.toHaveAttribute('data-focused');
        }
    },
    {
        name: 'field-required',
        async run(driver) {
            const { page, root } = driver;
            const error = page.locator('#field-error');
            const submit = page.getByRole('button', { name: 'Save' });
            const submissions = page.getByTestId('submissions');
            await expect(error).toBeHidden();
            await expect(root).toHaveAttribute('aria-required', 'true');
            await submit.click();
            await expect(submissions).toHaveText('0');
            await expect(root).toBeFocused();
            await expect(root).toHaveAttribute('aria-invalid', 'true');
            await expect(error).toBeVisible();
            await expect(root).toHaveAccessibleDescription('Account settings. Sends email updates. Enable alerts.');
            await expect(page.getByTestId('thumb')).toHaveAttribute('data-invalid', '');
            await driver.fieldState('required submit focuses the invalid switch', ['data-focused'], []);

            await root.press('Space');
            await expect(error).toBeHidden();
            await expect(root).not.toHaveAttribute('aria-invalid');
            await expect(root).toHaveAccessibleDescription('Account settings. Sends email updates.');
            await expect(page.getByTestId('thumb')).toHaveAttribute('data-valid', '');
            await driver.fieldState(
                'accepting the required value clears the error',
                ['data-dirty', 'data-filled', 'data-focused'],
                [['alerts', 'yes']]
            );
            await submit.click();
            await expect(submissions).toHaveText('1');
        }
    },
    {
        name: 'field-errors',
        async run(driver) {
            const { page, root } = driver;
            const error = page.locator('#field-error');
            await expect(root).toHaveAttribute('aria-invalid', 'true');
            await expect(error).toHaveText('Use a verified email.');
            await expect(root).toHaveAccessibleDescription(
                'Account settings. Sends email updates. Use a verified email.'
            );

            await page.evaluate(() => {
                window.switchParity.cancelsChange = true;
            });
            await root.press('Space');
            await expect(error).toBeVisible();
            await expect(root).not.toBeChecked();
            await driver.fieldState('veto preserves the server error', ['data-focused'], []);

            await page.evaluate(() => {
                window.switchParity.cancelsChange = false;
            });
            await root.press('Space');
            await expect(error).toBeVisible();
            await expect(root).not.toBeChecked();
            await driver.fieldState('held request preserves the server error', ['data-focused'], []);

            await page.getByRole('button', { name: 'Apply request' }).click();
            await expect(error).toBeHidden();
            await expect(root).not.toHaveAttribute('aria-invalid');
            await expect(root).toHaveAccessibleDescription('Account settings. Sends email updates.');
            await page.getByRole('button', { name: 'Outside' }).focus();
            await driver.fieldState(
                'committing the checked value clears the server error',
                ['data-dirty', 'data-filled', 'data-touched'],
                [['alerts', 'yes']]
            );
        }
    }
];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new SwitchDriver(page, framework),
    readNativeEvents: (driver) => driver.native()
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
