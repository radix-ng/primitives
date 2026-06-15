import { expect, Page, test } from '@playwright/test';

/**
 * ADR 0015/0017 Phase-4 migration of Context Menu (composes `RdxMenuRoot`, so it inherits the new
 * floating dismissal engine) onto a real browser. Context menus open at the cursor via a virtual
 * anchor; these guard that opening + every dismissal path still works and throws no runtime errors.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

const trigger = '[rdxContextMenuTrigger]';
const popup = '[rdxMenuPopup]';

async function openAtTrigger(page: Page): Promise<void> {
    await page.locator(trigger).first().click({ button: 'right' });
    await expect(page.locator(popup)).toBeVisible();
}

test('right-click opens the context menu without runtime errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await gotoStory(page, 'primitives-context-menu--default');

    await openAtTrigger(page);
    expect(errors).toEqual([]);
});

test('Escape closes the context menu', async ({ page }) => {
    await gotoStory(page, 'primitives-context-menu--default');
    await openAtTrigger(page);

    await page.keyboard.press('Escape');
    await expect(page.locator(popup)).toHaveCount(0);
});

test('a modal context menu renders an internal backdrop (finding #1)', async ({ page }) => {
    await gotoStory(page, 'primitives-context-menu--default');
    await openAtTrigger(page);

    await expect(page.locator('[data-rdx-menu-internal-backdrop]')).toHaveCount(1);
});

test('an outside press closes the context menu', async ({ page }) => {
    await gotoStory(page, 'primitives-context-menu--default');
    await openAtTrigger(page);

    await page.mouse.click(5, 5);
    await expect(page.locator(popup)).toHaveCount(0);
});
