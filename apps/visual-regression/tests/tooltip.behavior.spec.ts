import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral check for the structural `*rdxTooltipPortal` (ADR 0010). Tooltip's old anatomy parked an
 * empty portal wrapper `<div>` in `<body>` (the portal sat outside the presence template); the
 * structural form relocates the positioner itself with no wrapper. Drives the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('tooltip teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-tooltip--default');

    await page.locator('[rdxTooltipTrigger]').first().hover();
    await expect(page.locator('[rdxTooltipPopup]')).toBeVisible();

    const parentTag = await page.locator('[rdxTooltipPositioner]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
});

/**
 * ADR 0015 migration of Tooltip onto the new floating dismissal engine (dismissal-only — no focus
 * manager). Browser-only: real keyboard / pointer dismissal needs a real browser.
 */
test.describe('Tooltip — new floating engine migration', () => {
    const trigger = '[rdxTooltipTrigger]';
    const popup = '[rdxTooltipPopup]';

    test('Escape closes the tooltip', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        await gotoStory(page, 'primitives-tooltip--default');

        await page.locator(trigger).first().hover();
        await expect(page.locator(popup)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);
        expect(errors).toEqual([]);
    });

    test('an outside press closes the tooltip', async ({ page }) => {
        await gotoStory(page, 'primitives-tooltip--default');

        await page.locator(trigger).first().hover();
        await expect(page.locator(popup)).toBeVisible();

        // Far top-left corner — outside the trigger and the popup.
        await page.mouse.click(5, 5);
        await expect(page.locator(popup)).toHaveCount(0);
    });
});
