import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral checks for submenu hover — the "safe polygon" traversal. These drive a *real* mouse
 * (velocity matters to the algorithm) against the built Storybook, so they live here next to the
 * Playwright visual suite rather than in the jsdom unit tests.
 *
 * The nested menu story stacks two adjacent submenu triggers ("Find" above "Spelling and Grammar").
 * Opening "Find" pops its submenu to the right; moving the cursor diagonally toward that submenu
 * necessarily passes over "Spelling and Grammar". Without a safe polygon the sibling would steal the
 * open submenu mid-traversal.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

const findTrigger = '[rdxMenuSubTrigger]:has-text("Find")';
const spellingTrigger = '[rdxMenuSubTrigger]:has-text("Spelling")';
// Submenu popups open to the right (`side="right"`); the root popup is `data-side="bottom"`. Scope
// by `data-side="right"` so `:has-text` doesn't also match the enclosing root popup.
const findSubmenu = '[rdxMenuPopup][data-side="right"]:has-text("Search Web")';
const spellingSubmenu = '[rdxMenuPopup][data-side="right"]:has-text("Show Spelling and Grammar")';

async function openEditMenu(page: Page): Promise<void> {
    await gotoStory(page, 'primitives-menu--nested');
    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]').first()).toBeVisible();
}

async function openFindSubmenu(page: Page): Promise<void> {
    await page.locator(findTrigger).hover();
    await expect(page.locator(findSubmenu)).toBeVisible();
}

test('diagonal traversal keeps the open submenu and does not steal to the sibling', async ({ page }) => {
    await openEditMenu(page);
    await openFindSubmenu(page);

    const find = await page.locator(findTrigger).boundingBox();
    const submenu = await page.locator(findSubmenu).boundingBox();
    if (!find || !submenu) throw new Error('missing layout boxes');

    // Start at the right edge of "Find" (the cursor's natural exit point toward the submenu) and
    // move to the lower-left corner of the Find submenu — a diagonal that crosses "Spelling".
    await page.mouse.move(find.x + find.width - 4, find.y + find.height / 2);
    await page.mouse.move(submenu.x + 8, submenu.y + submenu.height - 8, { steps: 10 });

    // The Find submenu stays open; the sibling never opened.
    await expect(page.locator(findSubmenu)).toBeVisible();
    await expect(page.locator(spellingSubmenu)).toHaveCount(0);
});

test('RTL: diagonal traversal toward a left-placed submenu keeps it open', async ({ page }) => {
    // Regression guard for the once-captured `data-side` bug: submenus here open to the LEFT
    // (`side="left"`), so a right-side-only polygon would close them mid-traversal.
    const findRtl = '[rdxMenuSubTrigger]:has-text("بحث")';
    const findRtlSubmenu = '[rdxMenuPopup][data-side="left"]:has-text("بحث في الويب")';
    const spellingRtlSubmenu = '[rdxMenuPopup][data-side="left"]:has-text("عرض التدقيق")';

    await gotoStory(page, 'primitives-menu--nested-rtl');
    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]').first()).toBeVisible();

    await page.locator(findRtl).hover();
    await expect(page.locator(findRtlSubmenu)).toBeVisible();

    const find = await page.locator(findRtl).boundingBox();
    const submenu = await page.locator(findRtlSubmenu).boundingBox();
    if (!find || !submenu) throw new Error('missing layout boxes');

    // Exit from the LEFT edge of "بحث" and descend into the left-placed submenu's near (right) edge,
    // past the trigger's bottom so the path crosses the sibling row. This exercises the safe-polygon
    // 'left' geometry (the popup resolves `data-side="left"`). Few, large steps keep pointer velocity
    // above the slow-cursor close threshold.
    await page.mouse.move(find.x + 4, find.y + find.height / 2);
    await page.mouse.move(submenu.x + submenu.width - 8, submenu.y + 70, { steps: 5 });
    await expect(page.locator(findRtlSubmenu)).toBeVisible();
    await expect(page.locator(spellingRtlSubmenu)).toHaveCount(0);
});

test('Escape closes only the deepest submenu, keeping the parent menu open (tree deepest-first)', async ({ page }) => {
    await openEditMenu(page);
    await openFindSubmenu(page);

    // The Find submenu is the deepest open layer. Escape (a document-level dismissal) closes only it —
    // the parent Edit menu stays open because the open submenu node blocks the parent's Escape.
    await page.keyboard.press('Escape');
    await expect(page.locator(findSubmenu)).toHaveCount(0);
    await expect(page.locator('[rdxMenuPopup]').first()).toBeVisible();

    // A second Escape now closes the parent.
    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});

test('a submenu renders no internal backdrop (only the root modal menu does, finding #1)', async ({ page }) => {
    await openEditMenu(page); // root menu opened by click → modal → one internal backdrop
    await expect(page.locator('[data-rdx-menu-internal-backdrop]')).toHaveCount(1);

    await openFindSubmenu(page); // submenu (parent.type === 'menu') → adds no backdrop of its own
    await expect(page.locator('[data-rdx-menu-internal-backdrop]')).toHaveCount(1);
});

test('an outside press closes the whole open menu chain (tree containment)', async ({ page }) => {
    await openEditMenu(page);
    await openFindSubmenu(page);
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(2);

    // A press far outside both popups closes the entire stack — the submenu is logically "inside" the
    // parent via the shared floating tree, so neither survives.
    await page.mouse.click(5, 5);
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});

test('a mouse click on a hover-opened submenu trigger does not close it (no flicker)', async ({ page }) => {
    await openEditMenu(page);
    await openFindSubmenu(page); // hover opens the Find submenu
    await expect(page.locator(findSubmenu)).toBeVisible();

    // A real mouse click on the (hover-driven) sub-trigger is ignored, so the submenu stays open instead
    // of toggling shut (Base UI `ignoreMouse: openOnHover`).
    await page.locator(findTrigger).click();
    await page.waitForTimeout(60);
    await expect(page.locator(findSubmenu)).toBeVisible();
});

test('selecting an item inside a submenu closes the whole menu chain, not just the submenu', async ({ page }) => {
    await openEditMenu(page);
    await openFindSubmenu(page);
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(2);

    // Click an item in the Find submenu — selecting an item dismisses the entire menu (root + submenu),
    // not just the innermost popup.
    await page.locator(findSubmenu).locator('[rdxMenuItem]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});

test('moving straight down to the sibling switches submenus', async ({ page }) => {
    await openEditMenu(page);
    await openFindSubmenu(page);

    const spelling = await page.locator(spellingTrigger).boundingBox();
    if (!spelling) throw new Error('missing layout box');

    // Move straight down onto "Spelling" (away from the Find submenu's safe polygon). Find closes;
    // a continued nudge over Spelling (after the pointer-events tunnel lifts) opens its submenu.
    await page.mouse.move(spelling.x + spelling.width / 2, spelling.y - 20);
    await page.mouse.move(spelling.x + spelling.width / 2, spelling.y + spelling.height / 2, { steps: 6 });
    await expect(page.locator(findSubmenu)).toHaveCount(0);

    await page.locator(spellingTrigger).hover();
    await page.mouse.move(spelling.x + spelling.width / 2 + 4, spelling.y + spelling.height / 2 + 2);
    await expect(page.locator(spellingSubmenu)).toBeVisible();
});
