import { expect, Page, test } from '@playwright/test';
import { pauseClockBeforeInteraction } from '../helpers/clock';

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

test('a nested context area opens once without reopening its parent', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await gotoStory(page, 'primitives-context-menu--nested-areas');
    const areas = page.locator(trigger);
    await areas.first().evaluate((element) => {
        element.addEventListener('contextmenu', () => element.setAttribute('data-parent-request', ''));
    });
    const inner = (await areas.nth(1).boundingBox())!;
    await page.mouse.click(inner.x + 12, inner.y + 12, { button: 'right' });
    await expect(page.locator(`${popup}[data-open]`)).toHaveCount(1);
    await expect(areas.first()).not.toHaveAttribute('data-parent-request', '');
    await page.getByRole('menuitem', { name: 'Share', exact: true }).press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'Copy link', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator(`${popup}[data-open]`)).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator(popup)).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('one context menu reopens from a second area on the same native right-click', async ({ page }) => {
    await page.clock.install();
    await gotoStory(page, 'primitives-context-menu--multiple-areas');
    const areas = page.locator(trigger);
    await areas.first().click({ button: 'right' });
    await expect(page.locator(`${popup}[data-open]`)).toHaveCount(1);
    const second = (await areas.nth(1).boundingBox())!;
    // Keep native events in one paint frame; protocol latency must not choose an exit lifecycle.
    await pauseClockBeforeInteraction(page);
    await page.mouse.click(second.x + 12, second.y + 12, { button: 'right' });
    await page.clock.runFor(100);
    await page.clock.resume();
    await expect(page.locator(`${popup}[data-open]`)).toHaveCount(1);
    await expect
        .poll(async () => {
            const box = (await page.locator(`${popup}[data-open]`).boundingBox())!;
            return Math.abs(box.x - (second.x + 16));
        })
        .toBeLessThanOrEqual(2);
    await page.getByRole('menuitem', { name: 'Duplicate', exact: true }).click();
    await expect(page.locator(popup)).toHaveCount(0);
    await expect(page.locator('output')).toHaveText('Selected: Duplicate');
});

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

test('a modal context menu traps focus — a focus-out does not close it (finding #3)', async ({ page }) => {
    await gotoStory(page, 'primitives-context-menu--default');
    await openAtTrigger(page);

    // Programmatically move focus to an element outside the menu. A context menu is the one menu kind
    // that TRAPS focus (Base UI `FloatingFocusManager modal`), so focus is pulled back and it stays open.
    await page.evaluate(() => {
        const b = document.createElement('button');
        b.id = 'cm-outside';
        document.body.appendChild(b);
        b.focus();
    });
    await page.waitForTimeout(120); // let the async focus-out check settle
    await expect(page.locator(popup)).toBeVisible();
});

test('an outside press closes the context menu', async ({ page }) => {
    await gotoStory(page, 'primitives-context-menu--default');
    await openAtTrigger(page);

    await page.mouse.click(5, 5);
    await expect(page.locator(popup)).toHaveCount(0);
});

test('the release that ends the opening right-click never selects an item', async ({ page }) => {
    // The `contextmenu` gesture ends with a `mouseup` on whatever now sits under the cursor — often a
    // menu item, since the popup opens right there. Selecting it would be an accident on every
    // platform, so the trigger records where the gesture started and items ignore that release.
    await gotoStory(page, 'primitives-context-menu--default');

    const area = page.locator(trigger).first();
    const box = (await area.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.mouse.move(x, y);
    await page.mouse.down({ button: 'right' });
    await expect(page.locator(popup)).toBeVisible();
    await page.mouse.up({ button: 'right' });

    // The menu is still open: nothing was picked by the gesture's own release.
    await expect(page.locator(popup)).toBeVisible();
});

test('dragging the right button onto an item selects it on macOS only', async ({ page }) => {
    // macOS treats "hold the right button, drag onto an item, release" as a pick; Windows and Linux
    // give that release to the opening gesture. `rdxPlatform.os.mac` decides, so the expectation
    // follows the OS this run is on.
    const isMac = process.platform === 'darwin';
    await gotoStory(page, 'primitives-context-menu--default');

    const area = page.locator(trigger).first();
    const box = (await area.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down({ button: 'right' });
    await expect(page.locator(popup)).toBeVisible();

    const item = page.locator('[rdxMenuItem]').first();
    const itemBox = (await item.boundingBox())!;
    await page.mouse.move(itemBox.x + itemBox.width / 2, itemBox.y + itemBox.height / 2, { steps: 6 });
    await page.mouse.up({ button: 'right' });

    // Selecting an item closes the menu; ignoring the release leaves it open.
    await expect(page.locator(popup)).toHaveCount(isMac ? 0 : 1);
});
