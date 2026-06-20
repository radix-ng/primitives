import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral checks for Number Field that need a real browser — the stepper press-and-hold auto-repeat
 * (timer + pointer driven) and "interacts without error" are invisible to the jsdom unit suite, which
 * can't construct PointerEvents or run real timers against layout. Drives the built Storybook.
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

const input = '[rdxNumberFieldInput]';
const increment = '[rdxNumberFieldIncrement]';
const decrement = '[rdxNumberFieldDecrement]';

const readValue = (page: Page) => page.locator(input).inputValue();

test.describe('Number Field behavior', () => {
    test('steps the value on increment/decrement click', async ({ page }) => {
        const errors = await gotoStory(page, 'primitives-number-field--default');

        // Default story starts at 100.
        await expect(page.locator(input)).toHaveValue('100');

        await page.locator(increment).click();
        await expect(page.locator(input)).toHaveValue('101');

        await page.locator(decrement).click();
        await page.locator(decrement).click();
        await expect(page.locator(input)).toHaveValue('99');

        expect(errors).toEqual([]);
    });

    test('press-and-hold auto-repeats stepping by more than one', async ({ page }) => {
        const errors = await gotoStory(page, 'primitives-number-field--default');

        const start = Number(await readValue(page));

        // Hold the increment button long enough for the auto-repeat to tick several times.
        const box = await page.locator(increment).boundingBox();
        expect(box).not.toBeNull();
        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(900);
        await page.mouse.up();

        await expect.poll(async () => Number(await readValue(page))).toBeGreaterThan(start + 1);

        expect(errors).toEqual([]);
    });
});
