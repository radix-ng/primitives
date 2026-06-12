import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral check for the structural `*rdxSelectPortal` (ADR 0010). Select's old anatomy parked an
 * empty portal wrapper `<div>` in `<body>` permanently (the portal sat outside the presence template);
 * the structural form relocates the popup itself with no wrapper, only while open. Drives the built
 * Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('select teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-select--default');

    // Closed: nothing parked in <body>.
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);

    await page.locator('[rdxSelectTrigger]').first().click();
    const positioner = page.locator('[data-radix-popper-content-wrapper]');
    await expect(positioner).toBeVisible();

    // The positioner (the `*rdxSelectPortal` root) is the relocated root — a direct child of <body>,
    // no portal wrapper div.
    const parentTag = await positioner.evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');

    // ADR 0010 §6 ordering: the popup is the inner element, nested inside the positioner.
    const popupParentIsPositioner = await page
        .locator('[rdxSelectPopup]')
        .evaluate((el) => el.parentElement?.hasAttribute('data-radix-popper-content-wrapper') ?? false);
    expect(popupParentIsPositioner).toBe(true);
    expect(await page.locator('[rdxSelectItem]').count()).toBeGreaterThan(0);
});

/**
 * Regression for ADR 0010 §6 (select restructure: positioner outer, popup inner). After the swap the
 * popup is a `display:flex` column and `rdxSelectList` (which carries an inline `flex: 1`) became its
 * direct flex child. The list's inline flex overrode the demo's fixed viewport height, so the viewport
 * grew to fit all items, never overflowed, and both scroll buttons stayed `hidden`. The popup now owns
 * the height bound (`max-height` + `overflow-hidden`) so the `flex:1` viewport overflows and scrolls.
 */
test('with-scroll (popper): viewport overflows and scroll buttons toggle on scroll', async ({ page }) => {
    await gotoStory(page, 'primitives-select--with-scroll');
    await page.locator('[rdxSelectTrigger]').first().click();

    const up = page.locator('[rdxSelectScrollUpButton]');
    const down = page.locator('[rdxSelectScrollDownButton]');
    const list = page.locator('[rdxSelectList]');

    // At the top: down is shown, up is hidden.
    await expect(down).toBeVisible();
    await expect(up).toBeHidden();

    // The viewport is genuinely scrollable (height-bounded), not expanded to its full content.
    const { scrollHeight, clientHeight } = await list.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight
    }));
    expect(clientHeight).toBeLessThan(scrollHeight);

    // Scrolling the viewport reveals the up button.
    await list.evaluate((el) => el.scrollBy(0, 200));
    await expect(up).toBeVisible();
});

/**
 * Regression for the same restructure in `item-aligned` mode. Two issues are guarded here:
 *  1. NG0201 — `RdxSelectItemAlignedPosition` used to `inject(RdxCollectionProvider)`, but the provider
 *     now lives on the popup (a descendant), so opening threw. Items are read off the popup instead.
 *  2. The JS-computed height on `rdxSelectItemAlignedPosition` must cascade through the new popup layer
 *     to the viewport for the scroll buttons to appear.
 */
test('aligned-position opens without provider/runtime errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

    await gotoStory(page, 'primitives-select--aligned-position');
    await page.locator('[rdxSelectTrigger]').first().click();

    await expect(page.locator('[rdxSelectPopup]')).toBeVisible();
    expect(await page.locator('[rdxSelectItem]').count()).toBeGreaterThan(0);
    expect(errors).toEqual([]);
});

test('aligned-position-with-scroll: viewport overflows and scroll buttons toggle on scroll', async ({ page }) => {
    await gotoStory(page, 'primitives-select--aligned-position-with-scroll');
    await page.locator('[rdxSelectTrigger]').first().click();

    const up = page.locator('[rdxSelectScrollUpButton]');
    const down = page.locator('[rdxSelectScrollDownButton]');
    const list = page.locator('[rdxSelectList]');

    await expect(down).toBeVisible();
    await expect(up).toBeHidden();

    const { scrollHeight, clientHeight } = await list.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight
    }));
    expect(clientHeight).toBeLessThan(scrollHeight);

    await list.evaluate((el) => el.scrollBy(0, 200));
    await expect(up).toBeVisible();
});
