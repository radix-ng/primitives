import { expect, Page, test } from '@playwright/test';

/**
 * ADR 0015/0017 Phase-4 migration of Menubar (a coordinator over `RdxMenuRoot` + `rdxMenuTrigger`, so
 * each menu uses the new floating dismissal engine) onto a real browser. Guards that opening, switching
 * between sibling menus, and dismissal still work — the cases the per-menu (vs legacy global-stack)
 * containment had to preserve. The Default story keeps every menu popup mounted, so assertions scope to
 * the *open* popup (`[data-state="open"]`) rather than counting all mounted popups.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

const trigger = '[rdxMenuTrigger]';
const openPopup = '[rdxMenuPopup][data-state="open"]';

test('Tab enters the menubar on a trigger and arrow navigation keeps working', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--default');
    const triggers = page.locator(trigger);

    await expect(page.locator('[rdxMenubarRoot]')).not.toHaveAttribute('tabindex', /.+/);
    await expect(triggers.first()).toHaveAttribute('tabindex', '0');

    await page.keyboard.press('Tab');
    await expect(triggers.first()).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(triggers.nth(1)).toBeFocused();
    await expect(triggers.first()).toHaveAttribute('tabindex', '-1');
    await expect(triggers.nth(1)).toHaveAttribute('tabindex', '0');

    await page.keyboard.press('ArrowDown');
    await expect(page.locator(openPopup)).toHaveCount(1);
    await expect(triggers.nth(1)).toHaveAttribute('data-state', 'open');
});

test('opens a menu and keeps it open without runtime errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await gotoStory(page, 'primitives-menubar--default');

    await page.locator(trigger).first().click();
    // The freshly opened menu must not be dismissed by the async focus-outside check.
    await expect(page.locator(openPopup)).toHaveCount(1);
    expect(errors).toEqual([]);
});

test('hovering a sibling trigger switches menus — only one open at a time', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--default');
    const triggers = page.locator(trigger);

    await triggers.first().click();
    await expect(page.locator(openPopup)).toHaveCount(1);
    await expect(triggers.first()).toHaveAttribute('data-state', 'open');

    await triggers.nth(1).hover();
    // Switched: still exactly one open popup, now the second menu's.
    await expect(page.locator(openPopup)).toHaveCount(1);
    await expect(triggers.nth(1)).toHaveAttribute('data-state', 'open');
    await expect(triggers.first()).toHaveAttribute('data-state', 'closed');
});

test('Escape closes the open menu', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--default');
    await page.locator(trigger).first().click();
    await expect(page.locator(openPopup)).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(page.locator(openPopup)).toHaveCount(0);
});

test('an outside press closes the open menu', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--default');
    await page.locator(trigger).first().click();
    await expect(page.locator(openPopup)).toHaveCount(1);

    await page.mouse.click(5, 5);
    await expect(page.locator(openPopup)).toHaveCount(0);
});
