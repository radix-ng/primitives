import { expect, Page, test } from '@playwright/test';

async function example(page: Page): Promise<string[]> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    await page.goto('/iframe.html?id=primitives-select--arbitrary-values&viewMode=story');
    await expect(page.getByRole('combobox', { name: 'Boolean · Reactive Forms' })).toBeVisible();
    return errors;
}

async function submit(page: Page, expectedEntry?: [string, string]): Promise<[string, string][]> {
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByTestId('submitted-values')).not.toHaveText('Not submitted');
    if (expectedEntry) {
        await expect
            .poll(async () => JSON.parse(await page.getByTestId('submitted-values').innerText()))
            .toContainEqual(expectedEntry);
    }
    return JSON.parse(await page.getByTestId('submitted-values').innerText()) as [string, string][];
}

async function open(page: Page, name: string): Promise<void> {
    await page.getByRole('combobox', { name, exact: true }).click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
}

test('false remains a selected boolean and Reactive Forms receives a boolean change', async ({ page }) => {
    const errors = await example(page);
    const trigger = page.getByRole('combobox', { name: 'Boolean · Reactive Forms' });
    await expect(trigger).toHaveText('Disabled');
    await expect(trigger).not.toHaveAttribute('data-placeholder');
    expect(await submit(page)).toContainEqual(['enabled', 'false']);
    await open(page, 'Boolean · Reactive Forms');
    await expect(page.getByRole('option', { name: 'Disabled', exact: true })).toHaveAttribute('data-selected', '');
    await page.getByRole('option', { name: 'Enabled', exact: true }).click();
    await expect(page.getByTestId('boolean-value')).toHaveText('true');
    expect(await submit(page, ['enabled', 'true'])).toContainEqual(['enabled', 'true']);
    expect(errors).toEqual([]);
});

test('Date values flow through Signal Forms, native serialization and reset', async ({ page }) => {
    const errors = await example(page);
    await open(page, 'Date · Signal Forms');
    await expect(page.getByRole('option', { name: '2026-01-01', exact: true })).toHaveAttribute('data-selected', '');
    await page.getByRole('option', { name: '2026-02-01', exact: true }).click();
    await expect(page.getByTestId('date-value')).toHaveText('2026-02-01');
    expect(await submit(page)).toContainEqual(['date', '2026-02-01']);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByTestId('date-value')).toHaveText('2026-01-01');
    await expect(page.getByRole('combobox', { name: 'Date · Signal Forms' })).toHaveText('2026-01-01');
    expect(errors).toEqual([]);
});

test('a single array item submits one value while symbol multiple selection submits repeated entries', async ({
    page
}) => {
    const errors = await example(page);
    await open(page, 'Array · Single value');
    await expect(page.getByRole('option', { name: '10 × 20', exact: true })).toHaveAttribute('data-selected', '');
    await page.getByRole('option', { name: '30 × 40', exact: true }).click();
    await expect(page.getByTestId('coordinate-value')).toHaveText('30:40');
    await open(page, 'Symbols · Multiple values');
    await expect(page.getByRole('option', { name: 'primary', exact: true })).toHaveAttribute('data-selected', '');
    await page.getByRole('option', { name: 'secondary', exact: true }).click();
    await expect(page.getByTestId('token-value')).toHaveText('primary, secondary');
    await expect(page.getByRole('option', { selected: true })).toHaveCount(2);
    await page.keyboard.press('Escape');
    const entries = await submit(page);
    expect(entries.filter(([name]) => name === 'coordinates')).toEqual([['coordinates', '30:40']]);
    expect(entries.filter(([name]) => name === 'tokens')).toEqual([
        ['tokens', 'primary'],
        ['tokens', 'secondary']
    ]);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByTestId('coordinate-value')).toHaveText('10:20');
    await expect(page.getByTestId('token-value')).toHaveText('primary');
    expect(errors).toEqual([]);
});

test('autofill resolves an unopened array-valued item through its whole-item serializer', async ({ page }) => {
    const errors = await example(page);
    await page.locator('input[name="coordinates"]').evaluate((input: HTMLInputElement) => {
        input.value = '30:40';
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect(page.getByTestId('coordinate-value')).toHaveText('30:40');
    await expect(page.getByRole('combobox', { name: 'Array · Single value' })).toHaveAttribute(
        'aria-expanded',
        'false'
    );
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    expect(errors).toEqual([]);
});
