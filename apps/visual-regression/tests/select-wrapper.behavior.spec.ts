import { expect, Page, test } from '@playwright/test';

async function openExample(page: Page): Promise<string[]> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    await page.goto('/iframe.html?id=primitives-select--typed-wrapper&viewMode=story');
    await expect(page.getByRole('combobox')).toHaveCount(3);
    return errors;
}

test('wrapper trigger chevrons use centered SVG icons', async ({ page }) => {
    const errors = await openExample(page);
    for (const trigger of await page.getByRole('combobox').all()) {
        const icon = trigger.locator('svg[lucideChevronDown]');
        await expect(icon).toHaveCount(1);
        const centerOffset = await icon.evaluate((element) => {
            const icon = element.getBoundingClientRect();
            const trigger = element.closest('button')!.getBoundingClientRect();
            return Math.abs(icon.y + icon.height / 2 - (trigger.y + trigger.height / 2));
        });
        expect(centerOffset).toBeLessThan(1);
    }
    expect(errors).toEqual([]);
});

for (const [name, output] of [
    ['Reactive Forms country', 'reactive-value'],
    ['Signal Forms country', 'signal-value']
]) {
    test(`typed wrapper preserves keyboard, focus and reset with ${name}`, async ({ page }) => {
        const errors = await openExample(page);
        const trigger = page.getByRole('combobox', { name, exact: true });
        await expect(trigger).toHaveText(/France/);
        await trigger.press('ArrowDown');
        await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
        await page.keyboard.press('End');
        await expect(page.getByRole('option', { name: 'Japan', exact: true })).toHaveAttribute('data-highlighted', '');
        await page.keyboard.press('Enter');
        await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
        await expect(page.getByTestId(output)).toHaveText('jp');
        await expect(trigger).toBeFocused();
        await page.getByRole('button', { name: 'Reset countries' }).click();
        await expect(page.getByTestId(output)).toHaveText('fr');
        await expect(trigger).toHaveText(/France/);
        expect(errors).toEqual([]);
    });
}

test('typed multiple wrapper keeps the popup open and toggles selected objects', async ({ page }) => {
    const errors = await openExample(page);
    const trigger = page.getByRole('combobox', { name: 'Multiple countries', exact: true });
    await trigger.click();
    const france = page.getByRole('option', { name: 'France', exact: true });
    const japan = page.getByRole('option', { name: 'Japan', exact: true });
    await france.click();
    await expect(france).toHaveAttribute('aria-selected', 'true');
    await japan.click();
    await expect(page.getByTestId('multiple-value')).toHaveText('fr, jp');
    await france.click();
    await expect(france).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByTestId('multiple-value')).toHaveText('jp');
    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
});

test('closing a wrapper preserves focus deliberately moved outside the popup', async ({ page }) => {
    const errors = await openExample(page);
    await page.getByRole('combobox', { name: 'Multiple countries', exact: true }).click();
    await expect(page.locator('[rdxSelectPopup]')).toBeVisible();
    const reset = page.getByRole('button', { name: 'Reset countries' });
    await reset.focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect(reset).toBeFocused();
    expect(errors).toEqual([]);
});
