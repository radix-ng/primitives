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
    },
    {
        name: 'public-relationships',
        async run(driver: FieldDriver) {
            const { page } = driver;
            const field = page.getByTestId('relationships');
            const input = field.getByRole('textbox', { name: 'Account reference' });
            const label = field.locator('label');
            const validity = field.getByTestId('validity');
            const changeIds = page.getByRole('button', { name: 'Change field IDs' });
            const toggleParts = page.getByRole('button', { name: 'Toggle field parts' });
            const read = () =>
                field.evaluate((element) => {
                    const control = element.querySelector('input')!;
                    return {
                        control: control.id,
                        forId: element.querySelector('label')?.htmlFor ?? null,
                        name: control.getAttribute('aria-labelledby'),
                        description: control.getAttribute('aria-describedby')
                    };
                });

            await driver.checkpoint(
                'authored description precedes the Field description',
                {
                    control: 'reference',
                    forId: 'reference',
                    name: 'authored-name',
                    description: 'authored-help reference-help'
                },
                read
            );
            await expect(validity).toHaveText('neutral');
            await label.click();
            await expect(input).toBeFocused();
            await expect(label).toHaveAttribute('data-focused', '');
            await expect(page.locator('#reference-help')).toHaveAttribute('data-focused', '');
            await input.fill('temporary');
            await input.clear();
            await changeIds.focus();
            await expect(validity).toHaveText('false');
            await expect(validity).toHaveAttribute('data-missing', 'true');
            await expect(page.locator('#reference-help')).toHaveAttribute('data-invalid', '');
            await expect(page.locator('#reference-error')).toHaveAttribute('data-touched', '');

            await changeIds.click();
            await driver.checkpoint(
                'control, descriptions, and visible error follow new IDs',
                {
                    control: 'reference-next',
                    forId: 'reference-next',
                    name: 'authored-name',
                    description: 'authored-help reference-help-next reference-error-next'
                },
                read
            );
            await toggleParts.click();
            await driver.checkpoint(
                'unmounting parts keeps the authored relationships',
                {
                    control: 'reference-next',
                    forId: null,
                    name: 'authored-name',
                    description: 'authored-help'
                },
                read
            );
            await toggleParts.click();
            await expect(input).toHaveAttribute(
                'aria-describedby',
                'authored-help reference-help-next reference-error-next'
            );
            await input.fill('confirmed');
            await changeIds.focus();
            await expect(validity).toHaveText('true');
            await expect(validity).toHaveAttribute('data-missing', 'false');
            await expect(page.locator('#reference-help-next')).toHaveAttribute('data-valid', '');
            await expect(page.getByText('Enter a reference.')).toBeHidden();
        }
    },
    {
        name: 'default-validation-mode',
        async run(driver: FieldDriver) {
            const { page } = driver;
            const input = page.getByRole('textbox', { name: 'Default mode email' });
            const submit = page.getByRole('button', { name: 'Submit default mode' });
            const read = async () => ({ invalid: await input.getAttribute('aria-invalid') });
            await driver.checkpoint('initial validity is neutral', { invalid: null }, read);
            await input.focus();
            await submit.focus();
            await driver.checkpoint(
                'default validity after blur',
                {
                    invalid: driver.framework === 'angular' ? 'true' : null
                },
                read
            );
            await submit.click();
            await driver.checkpoint('submit reveals a missing value', { invalid: 'true' }, read);
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
