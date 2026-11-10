import { expect, Page, test } from '@playwright/test';

/**
 * Open-state visual checks for overlay primitives — this is where positioning and layout actually
 * matter and where the auto-generated story screenshots (closed trigger only) give little signal.
 *
 * Pattern: open the story's iframe, trigger the overlay (click / hover / right-click), wait for the
 * popup, then screenshot the whole page (popups render in a body portal, so `fullPage` keeps them
 * in frame). Add a new entry here for any overlay whose open layout you want pinned.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

async function shoot(page: Page, name: string): Promise<void> {
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(name, { fullPage: true });
}

test('menubar — file open', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--default');
    await page.getByRole('menuitem', { name: 'File', exact: true }).click();
    await expect(page.locator('[rdxMenuPopup][data-open]')).toHaveCount(1);
    await expect(page.locator('[rdxMenuPopup][data-open]')).toBeVisible();
    await shoot(page, 'menubar-file-open.png');
});

test('menubar — submenu open', async ({ page }) => {
    await gotoStory(page, 'primitives-menubar--default');
    await page.getByRole('menuitem', { name: 'File', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Export', exact: true }).press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'PDF', exact: true })).toBeFocused();
    await expect(page.locator('[rdxMenuPopup][data-open]')).toHaveCount(2);
    await shoot(page, 'menubar-submenu-open.png');
});

test('popover — open', async ({ page }) => {
    await gotoStory(page, 'primitives-popover--default');
    await page.locator('[rdxPopoverTrigger]').first().click();
    await expect(page.locator('[rdxPopoverPopup]')).toBeVisible();
    await shoot(page, 'popover-default-open.png');
});

test('dialog — open', async ({ page }) => {
    await gotoStory(page, 'primitives-dialog--default');
    await page.locator('[rdxDialogTrigger]').first().click();
    await expect(page.locator('[rdxDialogPopup]')).toBeVisible();
    await shoot(page, 'dialog-default-open.png');
});

test('tooltip — open', async ({ page }) => {
    await gotoStory(page, 'primitives-tooltip--default');
    await page.locator('[rdxTooltipTrigger]').first().hover();
    await expect(page.locator('[rdxTooltipPopup]')).toBeVisible();
    await shoot(page, 'tooltip-default-open.png');
});

test('menu — open', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');
    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();
    await shoot(page, 'menu-default-open.png');
});

test('select — open', async ({ page }) => {
    await gotoStory(page, 'primitives-select--default');
    await page.locator('[rdxSelectTrigger]').first().click();
    // The popup is a zero-size listbox layer; the visible positioned element is the popper wrapper
    // (the `rdxSelectPositioner` host), teleported to <body> by the structural `*rdxSelectPortal`.
    await expect(page.locator('[data-radix-popper-content-wrapper]')).toBeVisible();
    await shoot(page, 'select-default-open.png');
});

test('select — arrow', async ({ page }) => {
    await gotoStory(page, 'primitives-select--arrow');
    await page.getByRole('combobox').click();
    await expect(page.locator('[rdxSelectArrow]')).toBeVisible();
    await shoot(page, 'select-arrow-open.png');
});

test('select — deferred exit', async ({ page }) => {
    await gotoStory(page, 'primitives-select--deferred-unmount');
    await page.getByRole('combobox').click();
    await expect(page.getByTestId('completions')).toHaveText('true');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('phase')).toHaveText('Closing');
    await expect
        .poll(() =>
            page.locator('[rdxSelectPopup]').evaluate((element) => {
                const animations = element.getAnimations();
                animations.forEach((animation) => {
                    animation.pause();
                    animation.currentTime = 0;
                });
                return animations.some((animation) => animation.playState === 'paused');
            })
        )
        .toBe(true);
    // This intentionally paused external animation must not be auto-finished by screenshot capture.
    await expect(page).toHaveScreenshot('select-deferred-exit.png', { fullPage: true, animations: 'allow' });
});

test('context-menu — open', async ({ page }) => {
    await gotoStory(page, 'primitives-context-menu--default');
    await page.locator('[rdxContextMenuTrigger]').first().click({ button: 'right' });
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();
    await shoot(page, 'context-menu-default-open.png');
});
