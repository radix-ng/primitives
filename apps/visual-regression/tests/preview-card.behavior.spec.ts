import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral check for the structural `*rdxPreviewCardPortal` (ADR 0010): the positioner is relocated
 * directly into `<body>` with no portal wrapper element. Drives the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('preview-card teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-preview-card--default');

    await page.locator('[rdxPreviewCardTrigger]').first().hover();
    await expect(page.locator('[rdxPreviewCardPopup]')).toBeVisible();

    const parentTag = await page.locator('[rdxPreviewCardPositioner]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
});
