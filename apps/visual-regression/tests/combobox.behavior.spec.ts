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

/**
 * ADR 0015/0017 Phase-4 migration of Combobox onto the new floating dismissal engine.
 */
test.describe('Combobox — new floating engine migration', () => {
    const input = '[rdxComboboxInput]';
    const popup = '[rdxComboboxPopup]';

    test('Escape closes the combobox', async ({ page }) => {
        await gotoStory(page, 'primitives-combobox--default');
        await page.locator(input).click();
        await expect(page.locator(popup)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('an outside press closes the combobox', async ({ page }) => {
        await gotoStory(page, 'primitives-combobox--default');
        await page.locator(input).click();
        await expect(page.locator(popup)).toBeVisible();

        await page.mouse.click(5, 5);
        await expect(page.locator(popup)).toHaveCount(0);
    });
});

/**
 * Regression: in multiple mode, once focus has stepped into the chips (ArrowLeft from the input),
 * ArrowDown / ArrowUp must hand focus back to the input and engage the list — otherwise the popup
 * is unreachable from a chip and `aria-activedescendant` navigation is dead (jsdom can't catch this
 * — it needs real focus + an open popup).
 */
test('combobox ArrowDown from a focused chip returns to the input and navigates the list', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
    });

    await gotoStory(page, 'primitives-combobox--multiple');

    const input = page.locator('[rdxComboboxInput]');
    await input.click();
    await expect(page.locator('[rdxComboboxPopup]')).toBeVisible();

    // Apple is preselected; select two more so there are several chips.
    await page.locator('[rdxComboboxItem]', { hasText: 'Banana' }).click();
    await page.locator('[rdxComboboxItem]', { hasText: 'Grape' }).click();
    await expect(page.locator('[rdxComboboxChip]')).toHaveCount(3);

    // Step into the chips with the keyboard: focus lands on the last chip.
    await input.focus();
    await input.press('ArrowLeft');
    await expect(page.locator('[rdxComboboxChip]:focus')).toBeFocused();

    // The bug: focus stayed stuck on the chip and the list was unreachable. ArrowDown must hand
    // focus back to the input (so `aria-activedescendant` nav works) and highlight a list item.
    await page.keyboard.press('ArrowDown');
    await expect(input).toBeFocused();
    await expect(page.locator('[rdxComboboxChip]:focus')).toHaveCount(0);
    expect(await input.getAttribute('aria-activedescendant')).not.toBeNull();
    await expect(page.locator('[rdxComboboxItem][data-highlighted]')).toHaveCount(1);

    expect(errors).toEqual([]);
});

/**
 * Regression: the async-single example must NOT show the whole list on open — with `[filter]="null"`
 * and an empty query it shows the "Start typing…" status and zero items. After a query it loads
 * matches; after a selection the picked item stays available on reopen (never the pristine hint).
 */
test('combobox async single shows the status hint on open, not the full list', async ({ page }) => {
    await gotoStory(page, 'primitives-combobox--async');

    const input = page.locator('[rdxComboboxInput]');
    await input.click();
    await expect(page.locator('[rdxComboboxPopup]')).toBeVisible();

    // Nothing is loaded until the user types: only the status hint, no options.
    await expect(page.locator('[rdxComboboxItem]')).toHaveCount(0);
    await expect(page.locator('[rdxComboboxStatus]')).toContainText('Start typing to search people');
    // The empty list exposes data-empty for styling (Base UI's ComboboxList empty state).
    await expect(page.locator('[rdxComboboxList]')).toHaveAttribute('data-empty', '');

    // Typing streams in matches.
    await input.pressSequentially('mich');
    await expect(page.locator('[rdxComboboxItem]')).toHaveCount(1);
    await expect(page.locator('[rdxComboboxItem]').first()).toContainText('Michael Foster');
    // …and data-empty drops once options are present.
    await expect(page.locator('[rdxComboboxList]')).not.toHaveAttribute('data-empty', '');

    // Selecting fills the input and closes the popup.
    await page.locator('[rdxComboboxItem]').first().click();
    await expect(page.locator('[rdxComboboxPopup]')).toBeHidden();
    await expect(input).toHaveValue('Michael Foster');

    // Reopening keeps the selected user available — not the pristine "Start typing" hint.
    await page.locator('[rdxComboboxTrigger]').click();
    await expect(page.locator('[rdxComboboxItem]')).toHaveCount(1);
    await expect(page.locator('[rdxComboboxStatus]')).not.toContainText('Start typing');

    // Emptying the field deselects: the clear (×) hides and the popup resets to the pristine hint.
    await input.focus();
    await input.press('ControlOrMeta+A');
    await input.press('Delete');
    await expect(page.locator('[rdxComboboxClear]')).toHaveCount(0);
    await expect(page.locator('[rdxComboboxItem]')).toHaveCount(0);
    await expect(page.locator('[rdxComboboxStatus]')).toContainText('Start typing to search people');
});

/**
 * Regression: the Clear (×) button clears the selection AND resets the popup search, keeps focus on
 * the input, and then hides itself — aligned with Base UI's ComboboxClear.
 */
test('combobox Clear button resets the selection and the popup, keeping input focus', async ({ page }) => {
    await gotoStory(page, 'primitives-combobox--async');

    const input = page.locator('[rdxComboboxInput]');
    await input.click();
    await input.pressSequentially('mich');
    await expect(page.locator('[rdxComboboxItem]')).toHaveCount(1);
    await page.locator('[rdxComboboxItem]').first().click();
    await expect(input).toHaveValue('Michael Foster');

    // Reopen so the popup is visible, then clear.
    await page.locator('[rdxComboboxTrigger]').click();
    await expect(page.locator('[rdxComboboxClear]')).toBeVisible();
    await page.locator('[rdxComboboxClear]').click();

    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(page.locator('[rdxComboboxClear]')).toHaveCount(0);
    await expect(page.locator('[rdxComboboxItem]')).toHaveCount(0);
    await expect(page.locator('[rdxComboboxStatus]')).toContainText('Start typing to search people');
});

/**
 * Regression: the async-multiple example must NOT show the whole list on open either — empty query
 * shows the "Start typing…" hint with zero items. Picks become chips, the results stay available so
 * more can be added, and removing the last chip returns to the pristine hint (the item-press echo
 * suppression must not leak and kill the next real search).
 */
test('combobox async multiple shows the status hint on open, not the full list', async ({ page }) => {
    await gotoStory(page, 'primitives-combobox--async-multiple');

    const input = page.locator('[rdxComboboxInput]');
    const items = page.locator('[rdxComboboxItem]');

    await input.click();
    await expect(page.locator('[rdxComboboxPopup]')).toBeVisible();

    // Nothing loaded until the user types: only the hint, no options.
    await expect(items).toHaveCount(0);
    await expect(page.locator('[rdxComboboxStatus]')).toContainText('Start typing to search people');

    // Typing streams in matches; picking one turns into a chip while the results stay visible.
    await input.pressSequentially('mich');
    await expect(items).toHaveCount(1);
    await items.first().click();
    await expect(page.locator('[rdxComboboxChip]')).toHaveCount(1);
    await expect(page.locator('[rdxComboboxChip]').first()).toContainText('Michael Foster');
    await expect(input).toHaveValue('');

    // Removing the last chip returns to the pristine hint…
    await page.locator('[rdxComboboxChipRemove]').first().click();
    await expect(page.locator('[rdxComboboxChip]')).toHaveCount(0);
    await expect(items).toHaveCount(0);
    await expect(page.locator('[rdxComboboxStatus]')).toContainText('Start typing to search people');

    // …and a fresh search still works (the item-press suppression didn't leak).
    await input.pressSequentially('les');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Leslie Alexander');
});

/**
 * P2 (ADR 0014): grid combobox renders role=grid / role=row and arrow keys navigate the 2D grid with
 * no errors (real layout; jsdom unit covers the model, this covers the rendered roles + open path).
 */
test('combobox grid exposes grid/row roles and navigates with the arrow keys', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
    });

    await gotoStory(page, 'primitives-combobox--grid');

    const input = page.locator('[rdxComboboxInput]');
    await input.click();
    await expect(page.locator('[rdxComboboxPopup]')).toBeVisible();
    await expect(page.locator('[rdxComboboxList]')).toHaveAttribute('role', 'grid');
    await expect(page.locator('[rdxComboboxRow]').first()).toHaveAttribute('role', 'row');

    // ArrowDown highlights the first cell; ArrowRight moves within the row; ArrowDown drops a row.
    await input.press('ArrowDown');
    await expect(page.locator('[rdxComboboxItem][data-highlighted]')).toHaveCount(1);
    await input.press('ArrowRight');
    await input.press('ArrowDown');
    await expect(page.locator('[rdxComboboxItem][data-highlighted]')).toHaveCount(1);

    expect(errors).toEqual([]);
});
