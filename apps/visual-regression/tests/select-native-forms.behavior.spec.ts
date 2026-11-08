import { expect, Page, test } from '@playwright/test';

async function openExample(page: Page): Promise<string[]> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    await page.goto('/iframe.html?id=primitives-select--native-forms&viewMode=story');
    await expect(page.locator('input[data-rdx-native-input][name="country"]')).toBeAttached();
    return errors;
}

async function autofill(page: Page, value: string): Promise<void> {
    await page.locator('input[data-rdx-native-input][name="country"]').evaluate((input: HTMLInputElement, text) => {
        input.value = text;
        input.dispatchEvent(
            new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertReplacementText' })
        );
        input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }, value);
}

test('autofill matches labels without opening the popup or moving focus and updates Reactive Forms', async ({
    page
}) => {
    const errors = await openExample(page);
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await submit.focus();
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await autofill(page, 'canada');
    await expect(page.getByTestId('country-value')).toHaveText('CA');
    const trigger = page.getByRole('combobox', { name: 'Country', exact: true });
    await expect(trigger).toContainText('Canada');
    await expect(trigger).toHaveAttribute('data-dirty', '');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(submit).toBeFocused();
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-rdx-scroll-locked', '');
    await expect(page.locator('input[name="country"]')).toHaveCount(1);
    await expect(page.locator('input[name="country"]')).toHaveValue('CA');
    expect(errors).toEqual([]);
});

test('native validation blocks empty controls and focuses their visible triggers', async ({ page }) => {
    const errors = await openExample(page);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByTestId('submission')).toHaveText('Not submitted');
    await expect(page.getByRole('combobox', { name: 'Country', exact: true })).toBeFocused();
    await expect(page.getByText('Choose a country.', { exact: true })).toBeVisible();
    await autofill(page, 'CA');
    await expect(page.getByTestId('country-value')).toHaveText('CA');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Destinations', exact: true })).toBeFocused();
    await expect(page.getByTestId('submission')).toHaveText('Not submitted');
    expect(errors).toEqual([]);
});

test('submits one scalar plus repeated external-form entries and resets both controls', async ({ page }) => {
    const errors = await openExample(page);
    await autofill(page, 'CA');
    await expect(page.getByTestId('country-value')).toHaveText('CA');
    const destinations = page.getByRole('combobox', { name: 'Destinations', exact: true });
    await destinations.click();
    await page.getByRole('option', { name: 'United States', exact: true }).click();
    await page.getByRole('option', { name: 'France', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByTestId('submission')).toHaveText('country=CA; destinations=US,FR');
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByTestId('country-value')).toHaveText('none');
    await expect(destinations).toHaveAttribute('data-placeholder', '');
    await expect(page.getByRole('combobox', { name: 'Country', exact: true })).not.toHaveAttribute('data-dirty', '');
    expect(errors).toEqual([]);
});

test('focusing the native input redirects focus to the visible trigger', async ({ page }) => {
    const errors = await openExample(page);
    await expect(page.locator('input[name="country"]')).toHaveAttribute('autocomplete', 'country-name');
    await page.locator('input[name="country"]').evaluate((input: HTMLInputElement) => input.focus());
    await expect(page.getByRole('combobox', { name: 'Country', exact: true })).toBeFocused();
    expect(errors).toEqual([]);
});
