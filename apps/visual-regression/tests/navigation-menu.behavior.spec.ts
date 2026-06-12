import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral check for the structural `*rdxNavigationMenuPortal` (ADR 0010): the positioner is
 * relocated directly into `<body>` with no portal wrapper element. Drives the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('navigation menu teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-navigation-menu--default');

    await page.locator('[rdxNavigationMenuTrigger]').first().click();
    await expect(page.locator('[rdxNavigationMenuPopup]')).toBeVisible();

    const parentTag = await page.locator('[rdxNavigationMenuPositioner]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
});
