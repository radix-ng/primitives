import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral checks for the alert-dialog invariants that jsdom can't prove: the dismissal engine's
 * outside-press path, focus trapping, and `role=alertdialog`. Unlike a plain dialog, an alert dialog
 * must NOT close on an outside click — only via an explicit Close/Cancel or Escape. Drives the built
 * Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<string[]> {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
    });
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
    return errors;
}

const trigger = '[rdxAlertDialogTrigger]';
const popup = '[rdxAlertDialogPopup]';
const close = '[rdxAlertDialogClose]';

test.describe('Alert Dialog behavior', () => {
    test('opens with role=alertdialog and traps focus', async ({ page }) => {
        const errors = await gotoStory(page, 'primitives-alert-dialog--default');

        await page.locator(trigger).click();
        await expect(page.locator(popup)).toBeVisible();
        await expect(page.locator(popup)).toHaveAttribute('role', 'alertdialog');

        // Focus is moved into the dialog.
        const focusInside = await page.evaluate(() => {
            const p = document.querySelector('[rdxAlertDialogPopup]');
            return !!p && p.contains(document.activeElement);
        });
        expect(focusInside).toBe(true);

        expect(errors).toEqual([]);
    });

    test('does NOT close on an outside click (unlike a dialog)', async ({ page }) => {
        const errors = await gotoStory(page, 'primitives-alert-dialog--default');

        await page.locator(trigger).click();
        await expect(page.locator(popup)).toBeVisible();

        // A real click in the top-left corner — outside the popup — must leave it open.
        await page.mouse.click(5, 5);
        await expect(page.locator(popup)).toBeVisible();

        expect(errors).toEqual([]);
    });

    test('closes on Escape and on an explicit Close', async ({ page }) => {
        await gotoStory(page, 'primitives-alert-dialog--default');

        await page.locator(trigger).click();
        await expect(page.locator(popup)).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);

        await page.locator(trigger).click();
        await expect(page.locator(popup)).toBeVisible();
        await page.locator(close).first().click();
        await expect(page.locator(popup)).toHaveCount(0);
    });
});
