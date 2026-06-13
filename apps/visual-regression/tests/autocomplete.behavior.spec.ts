import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral checks for Autocomplete that need a real browser (live focus, text-input selection,
 * keyboard navigation and scroll-into-view) rather than jsdom. They drive the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

const input = 'input[rdxAutocompleteInput]';
const visibleItems = '[rdxAutocompleteItem]:not([hidden])';
const highlighted = '[rdxAutocompleteItem][data-highlighted]';
const popup = '[rdxAutocompletePopup]';

test.describe('Autocomplete auto highlight', () => {
    test('typing a full match highlights the item so Enter selects it', async ({ page }) => {
        await gotoStory(page, 'primitives-autocomplete--auto-highlight');

        await page.locator(input).click();
        await page.locator(input).pressSequentially('fix');

        // The matching option is highlighted immediately, with no arrow keys pressed.
        await expect(page.locator(highlighted)).toHaveText('fix');

        await page.locator(input).press('Enter');
        await expect(page.locator(input)).toHaveValue('fix');
    });
});

test.describe('Autocomplete inline completion', () => {
    test('keyboard navigation reflects the highlighted item in the input', async ({ page }) => {
        await gotoStory(page, 'primitives-autocomplete--inline-autocompletion');

        await page.locator(input).click();
        await page.locator(input).pressSequentially('fi');

        // First prefix match completes the typed text.
        await expect(page.locator(input)).toHaveValue('fix');

        // Arrowing to a match that does NOT start with the query still shows its full label.
        await page.locator(input).press('ArrowDown');
        await expect(page.locator(highlighted)).toHaveText('component: field');
        await expect(page.locator(input)).toHaveValue('component: field');
    });
});

test.describe('Autocomplete fuzzy matching', () => {
    test('highlights the matched text in a distinct colour', async ({ page }) => {
        await gotoStory(page, 'primitives-autocomplete--fuzzy-matching');

        await page.locator(input).click();
        await page.locator(input).pressSequentially('react');

        // The matched substring is wrapped in a <mark> inside the visible options.
        const mark = page.locator(`${visibleItems} mark`).first();
        await expect(mark).toBeVisible();
        await expect(mark).toHaveText(/react/i);

        // Highlighting must not split the word: the option still reads "React Hooks Guide", not
        // "Reac t Hooks Guide" (a <mark> interpolated in the template would gain stray spaces).
        await expect(page.locator(visibleItems).first()).toContainText('React Hooks Guide');

        // It must render in a distinct colour, not the surrounding text colour — the bug was an
        // invisible `text-primary` (≈ foreground). Compare the mark's colour to its parent text.
        const { markColor, textColor } = await mark.evaluate((el) => ({
            markColor: getComputedStyle(el).color,
            textColor: getComputedStyle(el.parentElement as HTMLElement).color
        }));
        expect(markColor).not.toBe(textColor);
    });
});

test.describe('Autocomplete async search', () => {
    test('loads nothing until a character is typed; ArrowDown does not reveal the catalogue', async ({ page }) => {
        await gotoStory(page, 'primitives-autocomplete--async');

        await page.locator(input).click();
        await page.locator(input).press('ArrowDown');
        // Empty input: no results were fetched, so there are no options and the popup stays hidden.
        await expect(page.locator(visibleItems)).toHaveCount(0);

        // Typing triggers the (debounced) async search, which returns a focused result set.
        await page.locator(input).pressSequentially('pulp');
        await expect(page.locator(visibleItems).filter({ hasText: 'Pulp Fiction' })).toBeVisible();
        expect(await page.locator(visibleItems).count()).toBeLessThan(10);
    });
});

test.describe('Autocomplete grid', () => {
    test('focuses the search input on open and navigates the grid with arrows', async ({ page }) => {
        await gotoStory(page, 'primitives-autocomplete--grid');

        await page.locator('[rdxAutocompleteTrigger]').click();

        // The search input lives inside the popup; opening must move focus to it.
        const search = page.locator('input[rdxAutocompleteInput]');
        await expect(search).toBeFocused();

        // Arrow keys then drive the 2D grid highlight (no DOM focus leaves the input).
        await page.keyboard.press('ArrowDown');
        await expect(page.locator(highlighted)).toBeVisible();
    });
});

test.describe('Autocomplete scroll into view', () => {
    test('arrowing down a long list scrolls the highlighted option into view', async ({ page }) => {
        await gotoStory(page, 'primitives-autocomplete--default');

        await page.locator(input).click();
        // "component" matches 35 options — more than the popup can show at once.
        await page.locator(input).pressSequentially('component');
        await expect(page.locator(visibleItems).first()).toBeVisible();
        expect(await page.locator(popup).evaluate((el) => el.scrollTop)).toBe(0);

        // Walk far enough down that the active option leaves the initial viewport.
        for (let i = 0; i < 14; i++) {
            await page.locator(input).press('ArrowDown');
        }

        // The popup scrolled to keep the highlighted option visible.
        expect(await page.locator(popup).evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        const active = page.locator(highlighted);
        await expect(active).toBeVisible();
        const box = await active.boundingBox();
        const popupBox = await page.locator(popup).boundingBox();
        if (!box || !popupBox) throw new Error('missing layout boxes');
        expect(box.y).toBeGreaterThanOrEqual(popupBox.y - 1);
        expect(box.y + box.height).toBeLessThanOrEqual(popupBox.y + popupBox.height + 1);
    });
});

/**
 * Regression (ADR 0014 review): in the emoji-picker layout the search Input lives inside the popup, so
 * the "Choose emoji" Trigger must be the focusable `role="combobox"` and reachable by Tab from the
 * very first render — before the popup (and its input) has ever mounted. jsdom only sees the attribute;
 * this asserts real keyboard focus traversal.
 */
test.describe('Autocomplete grid (emoji picker) trigger reachability', () => {
    const trigger = 'button[rdxAutocompleteTrigger]';

    test('the Choose emoji trigger is Tab-reachable before the popup ever opens', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        await gotoStory(page, 'primitives-autocomplete--grid');

        // Focusable from the initial render even though the input lives in the unopened popup.
        await expect(page.locator(trigger)).toHaveAttribute('tabindex', '0');

        // Tab from the message field lands on the trigger (not skipped past it).
        await page.locator('input[aria-label="Message"]').focus();
        await page.keyboard.press('Tab');
        await expect(page.locator(trigger)).toBeFocused();

        // ArrowDown opens the popup and focus moves into the in-popup search input.
        await page.keyboard.press('ArrowDown');
        await expect(page.locator(popup)).toBeVisible();
        await expect(page.locator(input)).toBeFocused();
        expect(errors).toEqual([]);
    });

    test('Home / End jump to the first / last emoji in the grid', async ({ page }) => {
        await gotoStory(page, 'primitives-autocomplete--grid');
        await page.locator(trigger).click();
        await expect(page.locator(popup)).toBeVisible();

        const items = page.locator('[rdxAutocompleteItem]');
        await page.keyboard.press('ArrowDown'); // engage grid navigation
        await page.keyboard.press('End');
        await expect(items.last()).toHaveAttribute('data-highlighted', '');
        await page.keyboard.press('Home');
        await expect(items.first()).toHaveAttribute('data-highlighted', '');
    });

    test('selecting an emoji inserts it and returns focus to the message field', async ({ page }) => {
        await gotoStory(page, 'primitives-autocomplete--grid');

        await page.locator(trigger).click();
        await expect(page.locator(popup)).toBeVisible();

        const firstEmoji = page.locator('[rdxAutocompleteItem]').first();
        const emojiChar = (await firstEmoji.textContent())?.trim();
        await firstEmoji.click();

        // The popup closes and focus lands on the message field (not the trigger), with the emoji inserted.
        await expect(page.locator(popup)).toBeHidden();
        const message = page.locator('input[aria-label="Message"]');
        await expect(message).toBeFocused();
        expect(await message.inputValue()).toContain(emojiChar ?? '😀');
    });
});
