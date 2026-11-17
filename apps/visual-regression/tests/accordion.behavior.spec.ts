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
