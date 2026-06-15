import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral checks for the structural `*rdxPopoverPortal` (ADR 0010) that need a real browser —
 * jsdom runs no CSS, so it cannot exercise the exit-`@keyframes` that keep content mounted. They drive
 * the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

const trigger = '[rdxPopoverTrigger]';
const positioner = '[rdxPopoverPositioner]';
const popup = '[rdxPopoverPopup]';

test.describe('Popover structural portal', () => {
    test('teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
        await gotoStory(page, 'primitives-popover--default');

        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        // The structural portal relocates the positioner itself — its parent is <body>, not an extra
        // portal wrapper div the old anatomy used to leave behind.
        const parentTag = await page.locator(positioner).evaluate((el) => el.parentElement?.tagName);
        expect(parentTag).toBe('BODY');
    });

    test('keeps content mounted through the exit animation, then unmounts it', async ({ page }) => {
        await gotoStory(page, 'primitives-popover--animated');

        await page.locator(trigger).first().click();
        await expect(page.locator(positioner)).toBeVisible();

        // Close via the popup's close button.
        await page.locator('[rdxPopoverClose]').click();

        // While the closed-state exit keyframes run on the positioner, the presence machine keeps the
        // content mounted (it would be gone instantly if the structural portal unmounted eagerly).
        await expect(page.locator(positioner)).toHaveAttribute('data-closed', '');

        // Once the exit animation finishes, the view is destroyed and leaves no orphan in <body>.
        await expect(page.locator(positioner)).toHaveCount(0);
        await expect(page.locator(popup)).toHaveCount(0);
    });
});

/**
 * ADR 0015/0017 Phase-4 migration of Popover onto the new floating engine (same pattern as Dialog).
 * Browser-only: trap / live focus / dismissal need a real browser.
 */
test.describe('Popover — new floating engine migration', () => {
    const focusInsidePopup = (page: Page) =>
        page.locator(popup).evaluate((el) => el.contains(el.ownerDocument.activeElement));

    test('Escape closes the popover', async ({ page }) => {
        await gotoStory(page, 'primitives-popover--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('an outside press closes the popover', async ({ page }) => {
        await gotoStory(page, 'primitives-popover--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        // Far top-left corner — outside the trigger and the popup.
        await page.mouse.click(5, 5);
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('a hover-opened popover does NOT pull focus into the popup (Base UI parity)', async ({ page }) => {
        await gotoStory(page, 'primitives-popover--hover');
        await page.locator(trigger).first().hover();
        await expect(page.locator(popup)).toBeVisible();

        // Hover-open disables the focus manager → no auto-focus into the popup.
        expect(await focusInsidePopup(page)).toBe(false);
    });

    test('a modal popover traps focus once it is inside — Tab keeps it in', async ({ page }) => {
        await gotoStory(page, 'primitives-popover--modal');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        // Like the legacy, a positioned popover does not auto-focus into the popup on open; once focus
        // is inside, the trap holds it there on Tab. (Auto-focus-on-open + Tab-from-trigger redirection
        // would need the deferred portal-focus bridge / guards.)
        await page.locator('[rdxPopoverClose]').focus();
        for (let i = 0; i < 4; i++) {
            await page.keyboard.press('Tab');
            expect(await focusInsidePopup(page)).toBe(true);
        }
    });
});
