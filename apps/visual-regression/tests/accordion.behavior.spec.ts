import { expect, test } from '@playwright/test';

test('Accordion array two-way binding accepts requests and honors cancellation', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-accordion--controlled&viewMode=story');
    const first = page.getByRole('button', { name: 'First', exact: true });
    const second = page.getByRole('button', { name: 'Second', exact: true });
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('type', 'button');
    await page.getByRole('checkbox', { name: 'Block changes' }).check();
    await second.press('Enter');
    await expect(page.getByTestId('accordion-value')).toHaveText('Selected: First');
    await expect(page.getByTestId('accordion-requests')).toHaveText('Requests: 1');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('checkbox', { name: 'Block changes' }).uncheck();
    await second.press('Space');
    await expect(page.getByTestId('accordion-value')).toHaveText('Selected: Second');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('region')).toHaveCount(1);
    await expect(page.getByRole('region')).toHaveText('Content for Second.');
    expect(errors).toEqual([]);
});

test('Accordion multiple default arrays remain interactive', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-accordion--multiple&viewMode=story');
    const triggers = page.locator('[rdxAccordionTrigger]');
    await expect(triggers.nth(0)).toHaveAttribute('aria-expanded', 'false');
    await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers.nth(2)).toHaveAttribute('aria-expanded', 'true');
    await triggers.nth(0).click();
    await expect(page.getByRole('region')).toHaveCount(3);
    await triggers.nth(1).click();
    await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('region')).toHaveCount(2);
    expect(errors).toEqual([]);
});

test('Accordion Panel views reset native state by default and preserve it when retained', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-accordion--panel-lifetime&viewMode=story');
    const reset = page.getByRole('button', { name: 'Reset state', exact: true });
    const keep = page.getByRole('button', { name: 'Keep state', exact: true });
    await expect(page.locator('#accordion-fresh-input')).toHaveCount(0);
    await expect(page.locator('#accordion-retained-input')).toHaveCount(1);
    await reset.click();
    await page.getByRole('textbox', { name: 'Fresh field' }).fill('edited');
    await reset.click();
    await expect(page.locator('#accordion-fresh-input')).toHaveCount(0);
    await reset.click();
    await expect(page.getByRole('textbox', { name: 'Fresh field' })).toHaveValue('initial');
    await keep.click();
    await page.getByRole('textbox', { name: 'Retained field' }).fill('edited');
    await keep.click();
    await expect(page.locator('#accordion-retained-input')).toBeHidden();
    await keep.click();
    await expect(page.getByRole('textbox', { name: 'Retained field' })).toHaveValue('edited');
    expect(errors).toEqual([]);
});
