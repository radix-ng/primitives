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

/**
 * ADR 0015/0017 Phase-4 migration of Navigation Menu onto the new floating dismissal engine
 * (node-optional capability: one shared popup, `node === null`).
 */
test.describe('Navigation Menu — new floating engine migration', () => {
    const trigger = '[rdxNavigationMenuTrigger]';
    const popup = '[rdxNavigationMenuPopup]';

    test('Escape closes the menu and returns focus to the trigger', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);
        await expect(page.locator(trigger).first()).toBeFocused();
    });

    test('closing popup animation holds its final frame until unmount', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.keyboard.press('Escape');

        const closingPopup = page.locator(`${popup}[data-ending-style]`);
        await expect(closingPopup).toBeVisible();
        await expect(closingPopup).toHaveCSS('animation-fill-mode', 'forwards');
        await expect(page.locator('[rdxNavigationMenuViewport] > [data-current]')).toHaveCount(1);
        await expect(page.locator('[rdxNavigationMenuViewport] > [data-previous]')).toHaveCount(0);
    });

    test('an outside press closes the menu', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.mouse.click(5, 5);
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('pressing a sibling trigger switches items instead of dismissing', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        const triggers = page.locator(trigger);
        await triggers.first().click();
        await expect(page.locator(popup)).toBeVisible();

        // A sibling trigger is a registered "inside" element, so opening it switches the shared popup
        // rather than counting as an outside press / focus-out that would dismiss.
        await triggers.nth(1).click();
        await expect(page.locator(popup)).toBeVisible();
    });

    test('ArrowLeft and ArrowRight move focus inside the open popup', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        const links = page.locator(`${popup} a`);
        await links.nth(0).focus();
        await expect(links.nth(0)).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(links.nth(1)).toBeFocused();

        await page.keyboard.press('ArrowLeft');
        await expect(links.nth(0)).toBeFocused();
    });

    test('ArrowLeft and ArrowRight include top-level links in list navigation', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        const triggers = page.locator(trigger);
        const githubLink = page.locator('a[rdxNavigationMenuLink]:has-text("GitHub")');

        await triggers.nth(1).focus();
        await expect(triggers.nth(1)).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(githubLink).toBeFocused();

        await page.keyboard.press('ArrowLeft');
        await expect(triggers.nth(1)).toBeFocused();
    });

    test('Tab exits the popup through the top-level navigation order', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        const triggers = page.locator(trigger);

        await triggers.first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.locator(`${popup} a`).last().focus();
        await page.keyboard.press('Tab');
        await expect(triggers.nth(1)).toBeFocused();
        await expect(page.locator(popup)).toContainText('Styling');

        await page.locator(`${popup} a`).last().focus();
        await page.keyboard.press('Tab');
        await expect(page.locator('a[rdxNavigationMenuLink]:has-text("GitHub")')).toBeFocused();
        await expect(page.locator(popup)).toHaveCount(0);
    });
});

test('nested navigation menu keeps parent and nested popups open when hovering the last nested trigger', async ({
    page
}) => {
    await gotoStory(page, 'primitives-navigation-menu--nested');

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Company")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("About")')).toBeVisible();

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Press")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("News")')).toBeVisible();

    await page.waitForTimeout(120);
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("About")')).toBeVisible();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("News")')).toBeVisible();
});

test('nested navigation menu keeps parent popup open when hovering a nested popup link', async ({ page }) => {
    await gotoStory(page, 'primitives-navigation-menu--nested');

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Company")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("About")')).toBeVisible();

    await page.locator('[rdxNavigationMenuTrigger]:has-text("About")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Mission")')).toBeVisible();

    await page.locator('[rdxNavigationMenuLink]:has-text("Mission")').hover();
    await page.waitForTimeout(120);

    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("About")')).toBeVisible();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Mission")')).toBeVisible();
});

test('nested inline navigation menu keeps the parent popup open when hovering the last nested trigger', async ({
    page
}) => {
    await gotoStory(page, 'primitives-navigation-menu--nested-inline');

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Browse")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Learn")')).toBeVisible();

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Resources")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Blog")')).toBeVisible();

    await page.waitForTimeout(120);
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Resources")')).toBeVisible();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Blog")')).toBeVisible();
});
