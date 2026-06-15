import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral check for the structural `*rdxPreviewCardPortal` (ADR 0010): the positioner is relocated
 * directly into `<body>` with no portal wrapper element. Drives the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('preview-card teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-preview-card--default');

    await page.locator('[rdxPreviewCardTrigger]').first().hover();
    await expect(page.locator('[rdxPreviewCardPopup]')).toBeVisible();

    const parentTag = await page.locator('[rdxPreviewCardPositioner]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
});

/**
 * ADR 0015 migration of Preview Card onto the new floating dismissal engine (dismissal-only — no focus
 * manager). Browser-only: real keyboard / pointer dismissal needs a real browser.
 */
test.describe('Preview Card — new floating engine migration', () => {
    const trigger = '[rdxPreviewCardTrigger]';
    const popup = '[rdxPreviewCardPopup]';

    test('Escape closes the preview-card', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        await gotoStory(page, 'primitives-preview-card--default');

        await page.locator(trigger).first().hover();
        await expect(page.locator(popup)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);
        expect(errors).toEqual([]);
    });

    test('an outside press closes the preview-card', async ({ page }) => {
        await gotoStory(page, 'primitives-preview-card--default');

        await page.locator(trigger).first().hover();
        await expect(page.locator(popup)).toBeVisible();

        // Far top-left corner — outside the trigger and the popup.
        await page.mouse.click(5, 5);
        await expect(page.locator(popup)).toHaveCount(0);
    });
});
