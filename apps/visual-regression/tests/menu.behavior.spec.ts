import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral checks for the structural `*rdxMenuPortal` (ADR 0010) — the net-new menu portal that
 * replaces the consumer-owned `@if (root.open())` mount, adding teleport + exit animations. Drives the
 * built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('menu teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');

    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    const parentTag = await page.locator('[rdxMenuPositioner]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
});

test('menu locks page scrolling by default and releases it when closed', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');

    const htmlOverflow = () => page.locator('html').evaluate((el) => el.style.overflow);

    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();
    expect(await htmlOverflow()).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
    expect(await htmlOverflow()).toBe('');
});

test('modal menu trigger stays interactive and closes the open menu on click', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');

    const trigger = page.locator('[rdxMenuTrigger]').first();
    await trigger.click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    await trigger.click();
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});

test('animated menu keeps the popup mounted through the exit animation, then unmounts it', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--animated');

    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPositioner]')).toBeVisible();

    // Close with Escape; the positioner's closed-state exit keyframe keeps it mounted briefly.
    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxMenuPositioner]')).toHaveAttribute('data-closed', '');

    // Once the exit animation finishes, presence destroys the view — no orphan in <body>.
    await expect(page.locator('[rdxMenuPositioner]')).toHaveCount(0);
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});
