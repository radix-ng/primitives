import { expect, Page, test } from '@playwright/test';

async function openExample(page: Page): Promise<string[]> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    await page.goto('/iframe.html?id=primitives-select--labels&viewMode=story');
    await expect(page.getByRole('combobox', { name: 'Billing country' })).toBeVisible();
    return errors;
}

for (const [label, name] of [
    ['[rdxSelectLabel]', 'Country Help'],
    ['[rdxFieldLabel]', 'Billing country'],
    ['[rdxComboboxLabel]', 'City'],
    ['[rdxAutocompleteLabel]', 'Search tags']
]) {
    test(`label ${label} names and focuses its control without opening a popup`, async ({ page }) => {
        const errors = await openExample(page);
        const control = page.getByRole('combobox', { name, exact: true });
        const labelElement = page.locator(label);
        await labelElement.click({ position: { x: 8, y: 8 } });
        await expect(control).toBeFocused();
        await expect(control).toHaveAttribute('aria-expanded', 'false');
        expect(errors).toEqual([]);
    });
}

test('label preserves nested button activation and root id is assigned only to the trigger', async ({ page }) => {
    const errors = await openExample(page);
    const help = page.getByRole('button', { name: 'Help', exact: true });
    await help.click();
    await expect(page.getByText('Choose the country you live in.')).toBeVisible();
    const trigger = page.getByRole('combobox', { name: 'Country Help', exact: true });
    await expect(trigger).not.toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#labelled-country')).toHaveCount(1);
    await expect(trigger).toHaveAttribute('id', 'labelled-country');
    await expect(page.locator('[rdxSelectLabel]')).toHaveAttribute('id', 'labelled-country-label');
    await page.locator('[rdxSelectLabel]').click({ position: { x: 8, y: 8 } });
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[rdxSelectPopup]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
});
