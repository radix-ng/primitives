import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral check for the structural `*rdxSelectPortal` (ADR 0010). Select's old anatomy parked an
 * empty portal wrapper `<div>` in `<body>` permanently (the portal sat outside the presence template);
 * the structural form relocates the popup itself with no wrapper, only while open. Drives the built
 * Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('select teleports the popup directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-select--default');

    // Closed: nothing parked in <body>.
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);

    await page.locator('[rdxSelectTrigger]').first().click();
    await expect(page.locator('[data-radix-popper-content-wrapper]')).toBeVisible();

    // The popup itself is the relocated root — a direct child of <body>, no portal wrapper div.
    const parentTag = await page.locator('[rdxSelectPopup]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
    expect(await page.locator('[rdxSelectItem]').count()).toBeGreaterThan(0);
});
