// Checks version: email-field-consumer/1. Frozen before the live coding session.
import { expect, test, type Page } from '@playwright/test';

const requiredMessage = 'Email is required.';
const emailMessage = 'Enter a valid email address.';
const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
    const collected: string[] = [];
    errors.set(page, collected);
    page.on('pageerror', (error) => collected.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') collected.push(message.text());
    });
});
test.afterEach(({ page }) => expect(errors.get(page), 'application browser errors').toEqual([]));

async function noErrors(page: Page) {
    await expect(page.getByText(requiredMessage, { exact: true })).toBeHidden();
    await expect(page.getByText(emailMessage, { exact: true })).toBeHidden();
}

for (const host of [
    {
        name: 'generated application',
        offset: 0,
        label: 'Project email',
        description: 'We will send project updates to this address.'
    },
    { name: 'independent parent', offset: 1, label: 'Billing email', description: 'Used only for receipt emails.' }
]) {
    test.describe(host.name, () => {
        test.beforeEach(async ({ page }) => {
            const port = Number(process.env['RADIX_GENERATION_PORT'] ?? 4521);
            await page.goto(`http://localhost:${port + host.offset}/`);
        });

        test('label/description association, initial hidden errors and required after blur', async ({ page }) => {
            const input = page.getByRole('textbox', { name: host.label, exact: true });
            await expect(input).toHaveAttribute('type', 'email');
            await expect(input).toHaveAccessibleDescription(host.description);
            await expect(input).toHaveValue('');
            await expect(page.getByTestId('control-value')).toHaveText('');
            await expect(page.getByTestId('control-touched')).toHaveText('false');
            await expect(page.getByTestId('control-pristine')).toHaveText('true');
            await expect(page.getByTestId('control-status')).toHaveText('INVALID');
            await noErrors(page);
            await page.getByText(host.label, { exact: true }).click();
            await expect(input).toBeFocused();
            await noErrors(page);
            await page.keyboard.press('Tab');
            await expect(page.getByRole('button', { name: 'Save email', exact: true })).toBeFocused();
            await expect(page.getByTestId('control-touched')).toHaveText('true');
            await expect(page.getByText(requiredMessage, { exact: true })).toBeVisible();
            await expect(page.getByText(emailMessage, { exact: true })).toBeHidden();
        });

        test('email validation and bidirectional parent control updates', async ({ page }) => {
            const input = page.getByRole('textbox', { name: host.label, exact: true });
            await input.fill('not-an-email');
            await expect(page.getByTestId('control-value')).toHaveText('not-an-email');
            await expect(page.getByTestId('control-pristine')).toHaveText('false');
            await noErrors(page);
            await page.keyboard.press('Tab');
            await expect(page.getByText(emailMessage, { exact: true })).toBeVisible();
            await expect(page.getByText(requiredMessage, { exact: true })).toBeHidden();
            await input.fill('corrected@example.com');
            await expect(page.getByTestId('control-value')).toHaveText('corrected@example.com');
            await expect(page.getByTestId('control-status')).toHaveText('VALID');
            await noErrors(page);
            await page.getByRole('button', { name: 'Set external email', exact: true }).click();
            await expect(input).toHaveValue('external@example.com');
            await expect(page.getByTestId('control-value')).toHaveText('external@example.com');
            await input.fill('user@example.com');
            await expect(page.getByTestId('control-value')).toHaveText('user@example.com');
        });

        test('disabled skips Tab, blocks pointer/editing, accepts external value and enables again', async ({
            page
        }) => {
            const input = page.getByRole('textbox', { name: host.label, exact: true });
            const external = page.getByRole('button', { name: 'Set external email', exact: true });
            const save = page.getByRole('button', { name: 'Save email', exact: true });
            const toggle = page.getByRole('checkbox', { name: 'Disable email', exact: true });
            await input.fill('before-disable@example.com');
            await toggle.check();
            await expect(input).toBeDisabled();
            await expect(page.getByTestId('control-disabled')).toHaveText('true');
            await expect(page.getByTestId('control-status')).toHaveText('DISABLED');
            await external.focus();
            await page.keyboard.press('Tab');
            await expect(save).toBeFocused();
            await expect(input).not.toBeFocused();
            await page.keyboard.press('Shift+Tab');
            await expect(external).toBeFocused();
            await input.click({ force: true });
            await expect(input).not.toBeFocused();
            await page.keyboard.type('blocked');
            await expect(input).toHaveValue('before-disable@example.com');
            await expect(page.getByTestId('control-value')).toHaveText('before-disable@example.com');
            await expect(page.getByTestId('submission-count')).toHaveText('0');
            await external.click();
            await expect(input).toHaveValue('external@example.com');
            await expect(page.getByTestId('control-value')).toHaveText('external@example.com');
            await expect(input).toBeDisabled();
            await toggle.uncheck();
            await expect(input).toBeEnabled();
            await expect(page.getByTestId('control-disabled')).toHaveText('false');
            await external.focus();
            await page.keyboard.press('Tab');
            await expect(input).toBeFocused();
            await input.fill('enabled@example.com');
            await expect(page.getByTestId('control-value')).toHaveText('enabled@example.com');
            await expect(page.getByTestId('control-status')).toHaveText('VALID');
        });

        test('reset restores flags, invalid submit exposes errors and valid submit delivers exactly once', async ({
            page
        }) => {
            const input = page.getByRole('textbox', { name: host.label, exact: true });
            const reset = page.getByRole('button', { name: 'Reset form', exact: true });
            const save = page.getByRole('button', { name: 'Save email', exact: true });
            await input.fill('invalid');
            await page.keyboard.press('Tab');
            await expect(page.getByText(emailMessage, { exact: true })).toBeVisible();
            await reset.click();
            await expect(input).toHaveValue('');
            await expect(page.getByTestId('control-value')).toHaveText('');
            await expect(page.getByTestId('control-pristine')).toHaveText('true');
            await expect(page.getByTestId('control-touched')).toHaveText('false');
            await noErrors(page);
            await save.click();
            await expect(page.getByTestId('submission-count')).toHaveText('0');
            await expect(page.getByTestId('submitted-value')).toHaveText('');
            await expect(page.getByTestId('control-touched')).toHaveText('true');
            await expect(page.getByText(requiredMessage, { exact: true })).toBeVisible();
            await reset.click();
            await expect(page.getByTestId('control-touched')).toHaveText('false');
            await expect(page.getByTestId('control-pristine')).toHaveText('true');
            await noErrors(page);
            await input.fill('latest@example.com');
            await save.click();
            await expect(page.getByTestId('submission-count')).toHaveText('1');
            await expect(page.getByTestId('submitted-value')).toHaveText('latest@example.com');
            await noErrors(page);
            await input.fill('next@example.com');
            await save.click();
            await expect(page.getByTestId('submission-count')).toHaveText('2');
            await expect(page.getByTestId('submitted-value')).toHaveText('next@example.com');
        });
    });
}
