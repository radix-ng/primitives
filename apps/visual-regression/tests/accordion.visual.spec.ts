import { expect, test } from '@playwright/test';

test('Horizontal Accordion renders its expanded content at a stable width', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-accordion--horizontal&viewMode=story');
    await expect(page.getByRole('button', { name: 'Is it accessible?', exact: true })).toHaveAttribute(
        'aria-expanded',
        'true'
    );
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('[rdxAccordionRoot]')).toHaveScreenshot('accordion-horizontal.png');
});
