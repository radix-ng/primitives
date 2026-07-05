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

    // `useScrollLock` marks `<html>` with `data-rdx-scroll-locked` (strategy-independent: the inset and
    // overlay-scrollbar strategies set different overflow properties, but both set the marker).
    const scrollLocked = () => page.locator('html').evaluate((el) => el.hasAttribute('data-rdx-scroll-locked'));

    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();
    expect(await scrollLocked()).toBe(true);

    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
    expect(await scrollLocked()).toBe(false);
});

test('Enter opens the default menu, focuses the first item, and ArrowDown moves to the next item', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');

    const trigger = page.locator('[rdxMenuTrigger]').first();
    const items = page.locator('[rdxMenuItem]');

    await trigger.focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();
    await expect(items.first()).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
});

test('a modal menu renders an internal backdrop that blocks the background and is the outside-press target (finding #1)', async ({
    page
}) => {
    await gotoStory(page, 'primitives-menu--default');

    // A fixed background button in the far corner that must NOT receive clicks while the modal menu is
    // open — the internal backdrop has to intercept them.
    await page.evaluate(() => {
        const b = document.createElement('button');
        b.id = 'rdx-bg-btn';
        b.style.cssText = 'position:fixed; right:2px; top:2px; width:40px; height:40px';
        b.addEventListener('click', () => {
            (window as { __bgHits?: number }).__bgHits = ((window as { __bgHits?: number }).__bgHits || 0) + 1;
        });
        document.body.appendChild(b);
    });

    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();
    await expect(page.locator('[data-rdx-menu-internal-backdrop]')).toHaveCount(1);

    // A press in the far corner lands on the backdrop (over the background button): the button must not
    // fire (background blocked) and the menu closes (the backdrop is the outside-press target).
    await page.mouse.click(10, 10);
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as { __bgHits?: number }).__bgHits || 0)).toBe(0);
});

test('modal menu trigger stays interactive and closes the open menu on click', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');

    const trigger = page.locator('[rdxMenuTrigger]').first();
    await trigger.click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    await trigger.click();
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});

test('a standalone menu closes when focus leaves to an unrelated element (finding #3)', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');
    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    // A standalone menu does NOT trap focus (only a context menu does) — moving focus to an unrelated
    // element closes it.
    await page.evaluate(() => {
        const b = document.createElement('button');
        b.id = 'm-outside';
        document.body.appendChild(b);
        b.focus();
    });
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

test('a keepMounted menu stays in the DOM while closed but is hidden (not in layout / tab order)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

    await gotoStory(page, 'primitives-menu--keep-mounted');
    const positioner = page.locator('[rdxMenuPositioner]');

    // Closed: the popup is teleported into <body> (kept mounted) but the native `hidden` removes it from
    // layout and the a11y / tab order — so it is present but not visible.
    await expect(positioner).toHaveCount(1);
    await expect(positioner).toHaveAttribute('hidden', '');
    await expect(positioner).toBeHidden();

    // Open: the `hidden` is dropped and the popup positions and shows.
    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(positioner).not.toHaveAttribute('hidden', /.*/);
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    // Close via Escape: focus returns to the trigger (the unmount-driven return never runs while kept
    // mounted — finding #3), and the popup hides again while staying in the DOM.
    await page.keyboard.press('Escape');
    await expect(positioner).toHaveAttribute('hidden', '');
    await expect(page.locator('[rdxMenuTrigger]')).toBeFocused();
    await expect(positioner).toHaveCount(1);

    // No endless positioning rAF loop / runtime errors while closed-and-mounted (finding #2).
    await page.waitForTimeout(200);
    expect(errors).toEqual([]);
});
