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
 * ADR 0015/0017 Phase-4 migration of Select onto the new floating dismissal engine.
 */
test.describe('Select — new floating engine migration', () => {
    const trigger = '[rdxSelectTrigger]';
    const popup = '[rdxSelectPopup]';

    test('Escape closes the select', async ({ page }) => {
        await gotoStory(page, 'primitives-select--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('an outside press closes the select', async ({ page }) => {
        await gotoStory(page, 'primitives-select--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.mouse.click(5, 5);
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('a modal select renders an internal backdrop that blocks the background (finding #1)', async ({ page }) => {
        await gotoStory(page, 'primitives-select--default');
        await page.evaluate(() => {
            const b = document.createElement('button');
            b.id = 'sel-bg';
            b.style.cssText = 'position:fixed; left:2px; top:2px; width:40px; height:40px';
            b.addEventListener('click', () => {
                (window as { __selBg?: number }).__selBg = ((window as { __selBg?: number }).__selBg || 0) + 1;
            });
            document.body.appendChild(b);
        });

        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();
        await expect(page.locator('[data-rdx-internal-backdrop]')).toHaveCount(1);

        // A press over the background button lands on the backdrop: the button must not fire and the
        // select closes (the backdrop is the outside-press target).
        await page.mouse.click(10, 10);
        await expect(page.locator(popup)).toHaveCount(0);
        expect(await page.evaluate(() => (window as { __selBg?: number }).__selBg || 0)).toBe(0);
    });
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

test('aligned-position locks page scroll even when modal=false (ADR 0016 AC #3)', async ({ page }) => {
    await gotoStory(page, 'primitives-select--aligned-position-non-modal');
    const scrollLocked = () => page.locator('html').evaluate((el) => el.hasAttribute('data-rdx-scroll-locked'));

    expect(await scrollLocked()).toBe(false);

    await page.locator('[rdxSelectTrigger]').first().click();
    await expect(page.locator('[rdxSelectPopup]')).toBeVisible();
    // A non-modal item-aligned select still locks (Base UI `(alignItemWithTriggerActive || modal) && open`)
    // — the popup overlays the trigger, so the page must not scroll behind it.
    expect(await scrollLocked()).toBe(true);

    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    expect(await scrollLocked()).toBe(false);
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

/**
 * Object values: items carry object `value`s and the root matches them by a stable key
 * (`[isItemEqualToValue]="'id'"`). Guards that the pre-selected `[value]` is matched **by id, not
 * reference** (the first item shows as selected), and that picking another updates the trigger.
 */
test('object values: pre-selects by id and updates the trigger on pick', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

    await gotoStory(page, 'primitives-select--object-values');
    const trigger = page.locator('[rdxSelectTrigger]');
    await expect(trigger).toContainText('Standard');

    await trigger.click();
    const items = page.locator('[rdxSelectItem]');
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toHaveAttribute('data-selected', ''); // matched by id, not reference

    await items.nth(1).click();
    await expect(trigger).toContainText('Express');
    expect(errors).toEqual([]);
});

/**
 * Keyboard navigation regression. In Popper mode the popup lives inside the positioner, which stays
 * `visibility: hidden` until placed — so the mount-time auto-focus no-ops on the hidden listbox and
 * arrow keys do nothing. The popup must re-focus itself once positioned. (jsdom can't catch this:
 * no real positioning, no visibility computation, no focus semantics.)
 */
test('keyboard navigation: opening focuses the listbox and arrows move the highlight', async ({ page }) => {
    await gotoStory(page, 'primitives-select--default');
    await page.locator('[rdxSelectTrigger]').first().click();

    const popup = page.locator('[rdxSelectPopup]');
    await expect(popup).toBeFocused(); // re-focused after the positioner becomes visible

    const activeDescendant = () => popup.getAttribute('aria-activedescendant');
    const first = await activeDescendant();
    await page.keyboard.press('ArrowDown');
    await expect.poll(activeDescendant).not.toBe(first); // highlight advanced via aria-activedescendant
});

test('mouse-opened select keeps keyboard navigation on the popup listbox', async ({ page }) => {
    await gotoStory(page, 'primitives-select--default');

    await page.locator('[rdxSelectTrigger]').click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await expect(page.locator('[rdxSelectItem]').nth(0)).toHaveAttribute('data-highlighted', '');

    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[rdxSelectItem]').nth(1)).toHaveAttribute('data-highlighted', '');

    await page.keyboard.press('ArrowUp');
    await expect(page.locator('[rdxSelectItem]').nth(0)).toHaveAttribute('data-highlighted', '');
});

/**
 * Arrow navigation must stop at the ends, not wrap around (native `<select>` behavior). Guards the
 * `loop: false` highlight model.
 */
test('keyboard navigation stops at the first/last item (no wrap-around)', async ({ page }) => {
    await gotoStory(page, 'primitives-select--default');
    await page.locator('[rdxSelectTrigger]').first().click();
    const popup = page.locator('[rdxSelectPopup]');
    await expect(popup).toBeFocused();
    const activeDescendant = () => popup.getAttribute('aria-activedescendant');

    // At the first item, ArrowUp keeps it on the first (does not wrap to the last).
    await page.keyboard.press('Home');
    const firstId = await activeDescendant();
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    expect(await activeDescendant()).toBe(firstId);

    // At the last item, ArrowDown keeps it on the last (does not wrap to the first).
    await page.keyboard.press('End');
    await expect.poll(activeDescendant).not.toBe(firstId);
    const lastId = await activeDescendant();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    expect(await activeDescendant()).toBe(lastId);
});

/**
 * Keyboard navigation must keep the highlighted item in view. The highlight model is pure state and
 * never scrolls, so without an explicit scroll-into-view the highlight walks past the viewport and
 * disappears behind the scroll buttons. Guards both positioning modes.
 */
for (const id of ['primitives-select--with-scroll', 'primitives-select--aligned-position-with-scroll']) {
    test(`keyboard navigation keeps the highlighted item in view (${id})`, async ({ page }) => {
        await gotoStory(page, id);
        await page.locator('[rdxSelectTrigger]').first().click();
        await expect(page.locator('[rdxSelectPopup]')).toBeFocused();

        const list = page.locator('[rdxSelectList]');

        // Walk down well past the initial fold (12 < item count in both stories → no wrap-around).
        for (let i = 0; i < 12; i++) {
            await page.keyboard.press('ArrowDown');
        }

        // The highlighted item's center stays inside the viewport box — i.e. the list scrolled to
        // follow the highlight instead of letting it walk off behind the scroll button.
        const highlighted = page.locator('[rdxSelectItem][data-highlighted]');
        await expect(highlighted).toBeVisible();
        await expect
            .poll(async () => {
                const item = await highlighted.boundingBox();
                const viewport = await list.boundingBox();
                if (!item || !viewport) return false;
                const center = item.y + item.height / 2;
                return center >= viewport.y && center <= viewport.y + viewport.height;
            })
            .toBe(true);
    });
}
