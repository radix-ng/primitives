import { expect, Page, test } from '@playwright/test';

/**
 * ADR 0015/0017 Phase-4 migration of Menubar (a coordinator over `RdxMenuRoot` + `rdxMenuTrigger`, so
 * each menu uses the new floating dismissal engine) onto a real browser. Guards that opening, switching
 * between sibling menus, and dismissal still work — the cases the per-menu (vs legacy global-stack)
 * containment had to preserve. The Default story keeps every menu popup mounted, so assertions scope to
 * the *open* popup (`[data-open]`) rather than counting all mounted popups. The popup uses Base UI's
 * `data-open`/`data-closed` state (not the Radix-era `data-state`); the trigger reflects open state via
 * `aria-expanded`.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

const trigger = '[rdxMenuTrigger]';
const openPopup = '[rdxMenuPopup][data-open]';

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
    await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
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
    await expect(triggers.first()).toHaveAttribute('aria-expanded', 'true');

    await triggers.nth(1).hover();
    // Switched: still exactly one open popup, now the second menu's.
    await expect(page.locator(openPopup)).toHaveCount(1);
    await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers.first()).toHaveAttribute('aria-expanded', 'false');
});

test('switching an open menubar focuses the new popup and ArrowDown enters its first item', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--default');
    const triggers = page.locator(trigger);

    await triggers.first().click();
    await expect(page.locator(openPopup)).toHaveCount(1);

    await page.keyboard.press('ArrowRight');
    await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(openPopup)).toBeFocused();

    await page.keyboard.press('ArrowDown');

    const firstItem = page.locator(`${openPopup} [rdxMenuItem]`).first();
    await expect(firstItem).toBeFocused();
    await expect(firstItem).toContainText('Undo');
});

test('native mouse-down opens before release and dragging selects a command', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    await gotoStory(page, 'primitives-menubar--default');
    const box = (await page.locator(trigger).first().boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(page.locator(openPopup)).toHaveCount(1);
    await page.waitForTimeout(240);
    const item = (await page.locator(`${openPopup} [rdxMenuItem]`).first().boundingBox())!;
    await page.mouse.move(item.x + item.width / 2, item.y + item.height / 2, { steps: 3 });
    await page.mouse.up();
    await expect(page.locator(openPopup)).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('Escape closes the open menu', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--default');
    await page.locator(trigger).first().click();
    await expect(page.locator(openPopup)).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(page.locator(openPopup)).toHaveCount(0);
});

test('vertical return arrow keeps interaction mode and reopens from trigger focus', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--vertical');
    const triggers = page.locator(trigger);
    await triggers.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(triggers.nth(1)).toBeFocused();
    await expect(page.locator(openPopup)).toHaveCount(0);
    await page.keyboard.press('ArrowRight');
    await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(openPopup)).toHaveCount(1);
    await expect(page.locator(openPopup).first().locator('[rdxMenuItem]').first()).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(triggers.nth(1)).toBeFocused();
    await expect(page.locator(openPopup)).toHaveCount(1);
    await expect(page.locator('[rdxMenubarRoot]')).toHaveAttribute('data-has-submenu-open', '');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(openPopup).first().locator('[rdxMenuItem]').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(triggers.nth(1)).toBeFocused();
    await expect(page.locator(openPopup)).toHaveCount(0);
    await expect(page.locator('[rdxMenubarRoot]')).not.toHaveAttribute('data-has-submenu-open');
});

test('a nested forward arrow switches the owning top-level menu', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--default');
    const triggers = page.locator(trigger);
    await triggers.first().press('ArrowDown');
    await expect(page.locator(openPopup).first().locator('[rdxMenuItem]').first()).toBeFocused();
    await page.locator('[rdxMenuSubTrigger]').first().press('ArrowRight');
    await expect(page.locator(openPopup)).toHaveCount(2);
    await expect(page.getByRole('menuitem', { name: 'Email Link', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers.first()).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(openPopup)).toHaveCount(1);
});

test('an outside press closes the open menu', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--default');
    await page.locator(trigger).first().click();
    await expect(page.locator(openPopup)).toHaveCount(1);

    await page.mouse.click(5, 5);
    await expect(page.locator(openPopup)).toHaveCount(0);
});
