import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral checks for Scroll Area that need a real browser — jsdom has no layout, so overflow
 * metrics, the thumb `translate3d` tracking, the focusable-viewport rule, and the `data-scrolling`
 * toggle can only be exercised here. Drives the built Storybook.
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

const viewport = '[rdxScrollAreaViewport]';
const scrollbar = '[rdxScrollAreaScrollbar]';
const thumb = '[rdxScrollAreaThumb]';

test.describe('Scroll Area behavior', () => {
    test('overflowing content makes the viewport scrollable and focusable', async ({ page }) => {
        const errors = await gotoStory(page, 'primitives-scroll-area--default');

        // Real layout: the content overflows the fixed-height viewport.
        const metrics = await page.locator(viewport).evaluate((el) => ({
            client: el.clientHeight,
            scroll: el.scrollHeight
        }));
        expect(metrics.client).toBeGreaterThan(0);
        expect(metrics.client).toBeLessThan(metrics.scroll);

        // The viewport is keyboard-focusable while it overflows.
        await expect(page.locator(viewport)).toHaveAttribute('tabindex', '0');

        // The vertical scrollbar is rendered and visible.
        await expect(page.locator(scrollbar)).toBeVisible();
        await expect(page.locator(scrollbar)).toHaveAttribute('data-orientation', 'vertical');

        expect(errors).toEqual([]);
    });

    test('scrolling moves the thumb', async ({ page }) => {
        const errors = await gotoStory(page, 'primitives-scroll-area--default');

        const transformBefore = await page.locator(thumb).evaluate((el) => getComputedStyle(el).transform);

        // Programmatic scroll fires the viewport scroll handler that positions the thumb.
        await page.locator(viewport).evaluate((el) => {
            el.scrollTop = 150;
            el.dispatchEvent(new Event('scroll'));
        });

        // The thumb tracks the scroll position via translate3d — its transform changes.
        await expect
            .poll(() => page.locator(thumb).evaluate((el) => getComputedStyle(el).transform))
            .not.toBe(transformBefore);

        expect(errors).toEqual([]);
    });
});
