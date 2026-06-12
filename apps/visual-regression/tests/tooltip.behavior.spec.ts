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
