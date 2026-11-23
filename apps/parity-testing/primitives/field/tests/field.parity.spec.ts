import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';

class FieldDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['fieldParity'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    async goto() {
        await this.page.goto('/' + this.framework + '.html');
        await expect(this.page.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.fieldParity);
    }

    async checkpoint(name: string, expected: Record<string, unknown>, read: () => Promise<Record<string, unknown>>) {
        await expect.poll(read, name).toEqual(expected);
        this.checkpoints.push({ name, state: await read() });
    }
}

const scenarios = [
    {
        name: 'native-constraints',
        async run(driver: FieldDriver) {
            const { page } = driver;
            const email = page.getByRole('textbox', { name: 'Email', exact: true });
            const profileName = page.getByRole('textbox', { name: 'Display name' });
            const submit = page.getByRole('button', { name: 'Submit profile' });
            const read = () =>
                email.evaluate((element: HTMLInputElement) => ({
                    invalid: element.hasAttribute('aria-invalid'),
                    describedBy: element.getAttribute('aria-describedby'),
                    focused: document.activeElement?.id ?? '',
                    submitted: document.querySelector('[data-testid="submits"]')?.textContent
                }));

            await expect(email).toHaveAttribute('required', '');
            await expect(email).not.toHaveAttribute('aria-invalid');
            await submit.click();
            await driver.checkpoint(
                'required email blocks submit and receives focus',
                {
                    invalid: true,
                    describedBy: 'missing-email',
                    focused: 'email',
                    submitted: '0'
                },
                read
            );
            await expect(page.getByText('Enter an email.')).toBeVisible();

            await email.fill('malformed');
            await driver.checkpoint(
                'native type mismatch replaces missing value',
                {
                    invalid: true,
                    describedBy: 'malformed-email',
                    focused: 'email',
                    submitted: '0'
                },
                read
            );
            await expect(page.getByText('Enter an email.')).toBeHidden();
            await expect(page.getByText('Use a valid email.')).toBeVisible();

            await email.fill('a@example.com');
            await submit.click();
            await driver.checkpoint(
                'focus moves to the next invalid control',
                {
                    invalid: false,
                    describedBy: null,
                    focused: 'display-name',
                    submitted: '0'
                },
                read
            );
            await expect(profileName).toHaveAttribute('aria-invalid', 'true');

            await profileName.fill('Ada');
            await submit.click();
            await expect(page.getByTestId('submits')).toHaveText('1');
            driver.checkpoints.push({ name: 'valid controls allow submission', state: { submitted: '1' } });
        }
    },
    {
        name: 'fieldset-disabled',
        async run(driver: FieldDriver) {
            const { page } = driver;
            const field = page.getByTestId('inherited-field');
            const read = () =>
                field.evaluate((element) => ({
                    fieldDisabled: element.hasAttribute('data-disabled'),
                    controlDisabled: element.querySelector('input')?.matches(':disabled')
                }));
            await driver.checkpoint(
                'inherits disabled from an outer fieldset',
                {
                    fieldDisabled: true,
                    controlDisabled: true
                },
                read
            );
            await page.getByRole('button', { name: 'Toggle fieldset' }).click();
            await driver.checkpoint(
                'outer fieldset re-enables the field',
                {
                    fieldDisabled: false,
                    controlDisabled: false
                },
                read
            );
        }
    },
    {
        name: 'nested-server-errors',
        async run(driver: FieldDriver) {
            const { page } = driver;
            const read = () =>
                page.evaluate(() => ({
                    outer: document.querySelector('#outer')?.getAttribute('aria-describedby'),
                    inner: document.querySelector('#inner')?.getAttribute('aria-describedby')
                }));
            const angular = driver.framework === 'angular';
            await driver.checkpoint(
                'both server errors are present',
                {
                    outer: 'outer-error',
                    inner: angular ? 'inner-error' : 'outer-error inner-error'
                },
                read
            );
            await page.getByRole('textbox', { name: 'Inner', exact: true }).fill('corrected');
            await driver.checkpoint(
                'inner edit clears only its own server error',
                {
                    outer: 'outer-error',
                    inner: angular ? null : 'outer-error'
                },
                read
            );
            await expect(page.getByText('Outer field error')).toBeVisible();
            await expect(page.getByText('Inner field error')).toBeHidden();
        }
    }
];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new FieldDriver(page, framework),
    readNativeEvents: () => Promise.resolve([])
});

for (const scenario of scenarios) {
    test(scenario.name, ({ browser, baseURL }, info) =>
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
