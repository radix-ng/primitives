import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral check for the structural `*rdxComboboxPortal` (ADR 0010): the positioner is relocated
 * directly into `<body>` with no portal wrapper element. Drives the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('combobox teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-combobox--default');

    await page.locator('[rdxComboboxInput]').click();
    await expect(page.locator('[rdxComboboxPopup]')).toBeVisible();

    const parentTag = await page.locator('[rdxComboboxPositioner]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
});

test('autocomplete teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-autocomplete--default');

    await page.locator('[rdxAutocompleteInput]').click();
    await page.locator('[rdxAutocompleteInput]').pressSequentially('co');
    await expect(page.locator('[rdxAutocompletePopup]')).toBeVisible();

    const parentTag = await page.locator('[rdxAutocompletePositioner]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
});
