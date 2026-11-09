import { expect, Page, test } from '@playwright/test';

async function setup(page: Page, edge: 'top' | 'middle' | 'bottom' = 'top', dir = 'ltr') {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize({ width: 640, height: 480 });
    await page.goto(`/iframe.html?id=primitives-select--viewport-edges&viewMode=story&args=edge:${edge};dir:${dir}`);
    const trigger = page.locator('[rdxSelectTrigger]');
    await trigger.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    return { trigger, errors };
}
async function visibleOption(page: Page, label: string) {
    await expect
        .poll(() =>
            page.getByRole('option', { name: label, exact: true }).evaluate((option) => {
                const a = option.getBoundingClientRect();
                const b = document.querySelector('[rdxSelectList]')!.getBoundingClientRect();
                const popup = document.querySelector('[rdxSelectPopup]')!.getBoundingClientRect();
                return a.top >= b.top - 1 && a.bottom <= b.bottom + 1 && popup.top >= 0 && popup.bottom <= innerHeight;
            })
        )
        .toBe(true);
}
for (const edge of ['top', 'middle', 'bottom'] as const) {
    test(`keyboard ends stay visible near viewport ${edge}`, async ({ page }) => {
        const { trigger, errors } = await setup(page, edge);
        await page.keyboard.press('End');
        await expect(page.getByRole('option', { name: 'Item 39' })).toHaveAttribute('data-highlighted', '');
        await visibleOption(page, 'Item 39');
        await expect(page.locator('[rdxSelectScrollDownButton]')).toBeHidden();
        await page.keyboard.press('Home');
        await visibleOption(page, 'Item 00');
        await expect(page.locator('[rdxSelectScrollUpButton]')).toBeHidden();
        await page.keyboard.press('Enter');
        await expect(trigger).toContainText('Item 00');
        expect(errors).toEqual([]);
    });
}
test('RTL navigation remains visible after scroll-button layout changes', async ({ page }) => {
    const { errors } = await setup(page, 'middle', 'rtl');
    await page.keyboard.press('End');
    await visibleOption(page, 'Item 39');
    await page.keyboard.press('Home');
    await visibleOption(page, 'Item 00');
    expect(errors).toEqual([]);
});

test('hovering a scroll button scrolls until the pointer leaves', async ({ page }) => {
    await page.clock.install();
    const { errors } = await setup(page, 'middle');
    await page.keyboard.press('Home');
    const list = page.locator('[rdxSelectList]');
    const down = page.locator('[rdxSelectScrollDownButton]');
    await expect(down).toBeVisible();
    const before = await list.evaluate((el) => el.scrollTop);
    await down.hover();
    const bounds = (await down.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width / 2 + 3, bounds.y + bounds.height / 2);
    await page.clock.runFor(200);
    expect(await list.evaluate((el) => el.scrollTop)).toBeGreaterThan(before);
    await page.mouse.move(0, 0);
    await page.clock.runFor(100);
    const stopped = await list.evaluate((el) => el.scrollTop);
    await page.clock.runFor(300);
    expect(await list.evaluate((el) => el.scrollTop)).toBe(stopped);
    expect(errors).toEqual([]);
});
