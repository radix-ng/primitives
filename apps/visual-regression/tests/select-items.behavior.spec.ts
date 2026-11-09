import { expect, Page, test } from '@playwright/test';

async function openExample(page: Page, story = 'items'): Promise<string[]> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    await page.goto(`/iframe.html?id=primitives-select--${story}&viewMode=story`);
    await expect(page.locator('[rdxSelectTrigger]')).toBeVisible();
    return errors;
}

test('resolves grouped labels before opening, after selection and for a null option', async ({ page }) => {
    const errors = await openExample(page);
    const trigger = page.getByRole('combobox', { name: 'Preferred language' });
    await expect(page.locator('[rdxSelectItem]')).toHaveCount(0);
    await expect(trigger).toContainText('Français');
    await trigger.click();
    await page.getByRole('option', { name: 'English', exact: true }).click();
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect(trigger).toContainText('English');
    await trigger.click();
    await page.getByRole('option', { name: 'No preference', exact: true }).click();
    await expect(trigger).toContainText('No preference');
    await expect(page.locator('[rdxSelectValue]')).toHaveAttribute('data-placeholder', '');
    await expect(page.getByTestId('language-value')).toHaveText('none');
    expect(errors).toEqual([]);
});

test('disabling hover preserves keyboard highlight and still allows pointer selection', async ({ page }) => {
    const errors = await openExample(page);
    const trigger = page.getByRole('combobox', { name: 'Preferred language' });
    await trigger.press('ArrowDown');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Home');
    const none = page.getByRole('option', { name: 'No preference', exact: true });
    const english = page.getByRole('option', { name: 'English', exact: true });
    await expect(none).toHaveAttribute('data-highlighted', '');
    await english.hover();
    await expect(none).toHaveAttribute('data-highlighted', '');
    await page.mouse.move(0, 0);
    await expect(none).toHaveAttribute('data-highlighted', '');
    await english.click();
    await expect(page.getByTestId('language-value')).toHaveText('en');
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
});

test('enabling hover updates the highlighted item on pointer movement', async ({ page }) => {
    const errors = await openExample(page);
    await page.getByRole('checkbox', { name: 'Highlight items on hover' }).check();
    await page.getByRole('combobox', { name: 'Preferred language' }).click();
    const english = page.getByRole('option', { name: 'English', exact: true });
    await english.hover();
    await expect(english).toHaveAttribute('data-highlighted', '');
    await page.mouse.move(0, 0);
    await expect(english).not.toHaveAttribute('data-highlighted', '');
    expect(errors).toEqual([]);
});

test('the first pointer move after keyboard navigation updates highlight without selecting', async ({ page }) => {
    const errors = await openExample(page);
    await page.getByRole('checkbox', { name: 'Highlight items on hover' }).check();
    await page.getByRole('combobox', { name: 'Preferred language' }).press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Home');
    const english = page.getByRole('option', { name: 'English', exact: true });
    // Give WebKit a prior pointer location so the actual hover carries a nonzero delta.
    await page.mouse.move(0, 0);
    await english.hover();
    await expect(english).toHaveAttribute('data-highlighted', '');
    await expect(page.getByTestId('language-value')).toHaveText('fr');
    expect(errors).toEqual([]);
});

test('clicking a multiple option updates highlight even when the first move has no delta', async ({ page }) => {
    const errors = await openExample(page, 'multiple');
    await page.getByRole('combobox', { name: 'Pick fruits' }).press('Enter');
    const popup = page.locator('[rdxSelectPopup]');
    await expect(popup).toBeFocused();
    const banana = page.getByRole('option', { name: 'Banana', exact: true });
    await banana.click();
    await expect(banana).toHaveAttribute('data-highlighted', '');
    await expect(banana).toHaveAttribute('aria-selected', 'true');
    const apple = page.getByRole('option', { name: 'Apple', exact: true });
    await apple.click();
    await expect(apple).toHaveAttribute('data-highlighted', '');
    await expect(apple).toHaveAttribute('aria-selected', 'false');
    await expect(popup).toBeVisible();
    expect(errors).toEqual([]);
});

test('a stationary cursor does not undo keyboard highlight when the list scrolls beneath it', async ({ page }) => {
    const errors = await openExample(page, 'with-scroll');
    await page.locator('[rdxSelectTrigger]').click();
    const popup = page.locator('[rdxSelectPopup]');
    await expect(popup).toBeFocused();
    await page.locator('[rdxSelectItem]').first().hover();
    await page.keyboard.press('End');
    const last = page.locator('[rdxSelectItem]').last();
    await expect(last).toHaveAttribute('data-highlighted', '');
    await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
    await expect(last).toHaveAttribute('data-highlighted', '');
    await expect(popup).toBeFocused();
    expect(errors).toEqual([]);
});
