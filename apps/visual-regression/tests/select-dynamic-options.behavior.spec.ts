import { expect, Page, test } from '@playwright/test';

async function setup(page: Page) {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto('/iframe.html?id=primitives-select--dynamic-options&viewMode=story');
    const trigger = page.locator('[rdxSelectTrigger]');
    await expect(trigger).toBeVisible();
    await trigger.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    return { trigger, errors };
}

test('live options update keyboard navigation after insertion and reorder', async ({ page }) => {
    const { trigger, errors } = await setup(page);
    await page.keyboard.press('F2');
    await expect(page.getByRole('option', { name: 'Apricot', exact: true })).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Apricot', exact: true })).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('F6');
    await expect(page.getByRole('option')).toHaveText(['Cherry', 'Banana', 'Apricot', 'Apple']);
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Apple', exact: true })).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('Enter');
    await expect(trigger).toContainText('Apple');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(errors).toEqual([]);
});

test('removing the selected option clears the value and leaves the list usable', async ({ page }) => {
    const { trigger, errors } = await setup(page);
    await page.keyboard.press('F3');
    await expect(page.getByRole('option', { name: 'Apple', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('dynamic-value')).toContainText('none');
    await expect(trigger).toContainText('Choose a fruit');
    await page.getByRole('option', { name: 'Cherry', exact: true }).click();
    await expect(trigger).toContainText('Cherry');
    await page.getByRole('button', { name: 'Restore options' }).click();
    await trigger.press('Enter');
    await expect(page.getByRole('option', { name: 'Apple', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Cherry', exact: true })).toHaveAttribute('aria-selected', 'true');
    expect(errors).toEqual([]);
});
