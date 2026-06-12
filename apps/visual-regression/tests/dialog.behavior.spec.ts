import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral checks for the structural `*rdxDialogPortal` (ADR 0010), exercising the **multi-root**
 * exit: the portal relocates backdrop + popup (two root nodes) with no wrapper element, and the
 * presence machine keeps the view mounted until the exit `@keyframes` on *both* roots finish. Needs a
 * real browser (jsdom runs no CSS); drives the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

const trigger = '[rdxDialogTrigger]';
const backdrop = '[rdxDialogBackdrop]';
const popup = '[rdxDialogPopup]';

test.describe('Dialog structural portal', () => {
    test('teleports backdrop and popup directly into <body> with no wrapper element', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--default');

        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        // Both roots are relocated as direct children of <body> — the old wrapper portal div is gone.
        const backdropParent = await page.locator(backdrop).evaluate((el) => el.parentElement?.tagName);
        const popupParent = await page.locator(popup).evaluate((el) => el.parentElement?.tagName);
        expect(backdropParent).toBe('BODY');
        expect(popupParent).toBe('BODY');
    });

    test('keeps both roots mounted through the exit animation, then unmounts them', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--default');

        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        // Close via the popup's X button.
        await page.locator('[rdxDialogClose][aria-label="Close"]').click();

        // Both roots run their closed-state exit keyframes (backdrop overlay-out, popup zoom-out); the
        // presence machine keeps them mounted until both finish.
        await expect(page.locator(backdrop)).toHaveAttribute('data-closed', '');
        await expect(page.locator(popup)).toHaveAttribute('data-closed', '');

        // Once the exit animations end, the whole view is destroyed — no orphans in <body>.
        await expect(page.locator(backdrop)).toHaveCount(0);
        await expect(page.locator(popup)).toHaveCount(0);
    });
});
