import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral check for the composite invariant that jsdom approximates but only a real browser proves
 * end-to-end: when items are reordered in place via an `@for` that reuses views (moving DOM nodes
 * without re-registering), the list's DOM-move observer must re-sort the index map so roving tabindex
 * and arrow navigation follow the NEW document order. Drives the built Storybook.
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

const STORY = 'utilities-composite--reorder';
const item = (id: string) => `[data-testid="${id}"]`;

test.describe('Composite reorder behavior', () => {
    test('keeps roving tabindex and arrow navigation correct after an in-place reorder', async ({ page }) => {
        const errors = await gotoStory(page, STORY);

        const root = page.locator('[rdxCompositeRoot]');

        // Initial document order and tab stop on the first item.
        await expect(root.locator('[rdxCompositeItem]')).toHaveText(['Overview', 'Metrics', 'Reports', 'Settings']);
        await expect(page.locator(item('overview'))).toHaveAttribute('tabindex', '0');
        await expect(page.locator(item('settings'))).toHaveAttribute('tabindex', '-1');

        // Reverse the list: Angular reuses the views and moves the DOM nodes.
        await page.locator('[data-testid="reorder"]').click();
        await expect(root.locator('[rdxCompositeItem]')).toHaveText(['Settings', 'Reports', 'Metrics', 'Overview']);

        // The highlighted native item survives; its index follows the new document order.
        await expect(page.locator(item('overview'))).toHaveAttribute('tabindex', '0');
        await expect(page.locator(item('settings'))).toHaveAttribute('tabindex', '-1');

        // Arrow navigation must step by the new order: Settings -> Reports.
        await page.locator(item('settings')).focus();
        await page.keyboard.press('ArrowRight');
        await expect(page.locator(item('reports'))).toBeFocused();

        expect(errors).toEqual([]);
    });
});

test('inherits live provider direction across a Portal into an LTR container', async ({ page }) => {
    const errors = await gotoStory(page, 'utilities-composite--portalled-direction');

    const destination = page.getByTestId('portal-destination');
    const composite = destination.locator(':scope > [rdxCompositeRoot]');
    const first = composite.getByRole('button', { name: 'One', exact: true });
    const middle = composite.getByRole('button', { name: 'Two', exact: true });
    const last = composite.getByRole('button', { name: 'Three', exact: true });
    const toggle = page.getByRole('button', { name: /^Switch primitive direction to/ });

    await expect(toggle).toHaveText('Switch primitive direction to LTR');
    await expect(composite).toHaveCSS('direction', 'ltr');
    await middle.press('ArrowRight');
    await expect(first).toBeFocused();

    await toggle.click();
    await expect(toggle).toHaveText('Switch primitive direction to RTL');
    await expect(composite).toHaveCSS('direction', 'ltr');
    await middle.press('ArrowRight');
    await expect(last).toBeFocused();

    expect(errors).toEqual([]);
});
