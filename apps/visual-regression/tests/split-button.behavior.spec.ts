import { expect, Page, test } from '@playwright/test';

/**
 * Regression checks for the Split Button recipe. Two browser-only bugs were caused by the recipe
 * deviating from the canonical menu pattern:
 *   1. Mounting the positioner with `@if (root.open())` instead of `*rdxMenuPortal` — in docs mode
 *      (two instances) the inline popup closed again on mouse-up.
 *   2. Binding the items with `(click)` instead of `(onSelect)` — keyboard activation (Enter) calls
 *      `preventDefault()` + `onSelect.emit()` and never fires a native click, so "Last action" stayed
 *      empty. jsdom cannot see either, so they live here.
 */
async function gotoStory(page: Page, storyId: string, viewMode: 'story' | 'docs' = 'story'): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=${viewMode}`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('opening the menu by mouse keeps it open (no open-then-close) in docs mode', async ({ page }) => {
    // The bug only surfaced with two recipe instances on the page, i.e. the docs view.
    await gotoStory(page, 'recipes-split-button--docs', 'docs');

    const trigger = page.locator('[rdxMenuTrigger]').first();
    await trigger.click();

    await expect(page.locator('[rdxMenuPopup]').first()).toBeVisible();
    // Stays open after the click settles.
    await page.waitForTimeout(350);
    await expect(page.locator('[rdxMenuPopup]').first()).toBeVisible();
});

test('keyboard (Enter) selection records the action in "Last action"', async ({ page }) => {
    await gotoStory(page, 'recipes-split-button--default');

    const trigger = page.locator('[rdxMenuTrigger]').first();
    await trigger.focus();
    await page.keyboard.press('Enter'); // open — focuses the first item
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();
    await expect(page.locator('[rdxMenuItem]').first()).toBeFocused();

    await page.keyboard.press('Enter'); // select the focused item via keyboard

    await expect(page.locator('p:has-text("Last action")')).toContainText('Save and duplicate');
    // Selecting closes the menu.
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});

test('mouse selection records the action in "Last action"', async ({ page }) => {
    await gotoStory(page, 'recipes-split-button--default');

    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    await page.locator('[rdxMenuItem]', { hasText: 'Save as template' }).click();

    await expect(page.locator('p:has-text("Last action")')).toContainText('Save as template');
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});
