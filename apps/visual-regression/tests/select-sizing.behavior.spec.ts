import { expect, Page, test } from '@playwright/test';

async function setup(page: Page, args = '') {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
    });
    await page.setViewportSize({ width: 640, height: 480 });
    await page.goto(`/iframe.html?id=primitives-select--sizing-and-fallback&viewMode=story&args=${args}`);
    const trigger = page.getByRole('combobox');
    await trigger.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    return {
        errors,
        trigger,
        positioner: page.locator('[rdxSelectItemAlignedPosition]'),
        panel: page.locator('[rdxSelectItemAlignedPositionContent]'),
        list: page.locator('[rdxSelectList]')
    };
}
async function inViewport(page: Page) {
    await expect
        .poll(() =>
            page.locator('[rdxSelectItemAlignedPositionContent]').evaluate((el) => {
                const r = el.getBoundingClientRect();
                return r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1;
            })
        )
        .toBe(true);
}
for (const index of [0, 39]) {
    test(`item-aligned list expands toward ${index === 0 ? 'top' : 'bottom'} on wheel`, async ({ page }) => {
        const { errors, positioner, list, trigger } = await setup(page, `initialIndex:${index}`);
        await expect(positioner).toHaveAttribute('data-side', 'none');
        const initial = (await positioner.boundingBox())!.height;
        const availableHeight = await positioner.evaluate((el) => {
            const style = getComputedStyle(el);
            return innerHeight - parseFloat(style.marginTop) - parseFloat(style.marginBottom);
        });
        // Native wheel deltas are input requests, not guaranteed travel (WebKitGTK scrolls
        // incrementally). Exercise growth to its observable limit instead of one input packet.
        await expect
            .poll(
                async () => {
                    const rect = (await list.boundingBox())!;
                    await page.mouse.move(rect.x + 1, rect.y + rect.height / 2);
                    await page.mouse.wheel(0, index === 0 ? 1200 : -1200);
                    return (await positioner.boundingBox())!.height;
                },
                { timeout: 10_000, intervals: [100] }
            )
            .toBeGreaterThanOrEqual(availableHeight - 1);
        const grown = (await positioner.boundingBox())!.height;
        expect(grown).toBeGreaterThan(initial + 20);
        expect(grown).toBeLessThanOrEqual(availableHeight + 1);
        await expect(trigger).toContainText(index === 0 ? 'Item 00' : 'Item 39');
        await inViewport(page);
        expect(errors).toEqual([]);
    });
}
test('an explicit max-height bounds the visible panel during scrolling', async ({ page }) => {
    const { errors, panel, list } = await setup(page, 'capped:true');
    expect((await panel.boundingBox())!.height).toBeLessThanOrEqual(241);
    const rect = (await list.boundingBox())!;
    await page.mouse.move(rect.x + 1, rect.y + rect.height / 2);
    await page.mouse.wheel(0, 200);
    await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    expect((await panel.boundingBox())!.height).toBeLessThanOrEqual(241);
    expect(errors).toEqual([]);
});
for (const [edge, side] of [
    ['near-top', 'bottom'],
    ['bottom', 'top']
]) {
    test(`a trigger near ${edge} falls back with a ${side} arrow`, async ({ page }) => {
        const { errors, positioner } = await setup(page, `edge:${edge}`);
        await expect(positioner).toHaveAttribute('data-side', side);
        await expect(page.locator('[rdxSelectArrow]')).toBeVisible();
        await expect(page.locator('[rdxSelectArrow]')).toHaveAttribute('data-side', side);
        await inViewport(page);
        expect(errors).toEqual([]);
    });
}
test('a transformed portal uses anchored geometry and keeps selection usable', async ({ page }) => {
    const { errors, positioner, trigger } = await setup(page, 'transformed:true');
    await expect(positioner).not.toHaveAttribute('data-side', 'none');
    await expect(page.getByTestId('viewport-portal').locator('[rdxSelectItemAlignedPosition]')).toHaveCount(1);
    await inViewport(page);
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(trigger).toContainText('Item 39');
    expect(errors).toEqual([]);
});
test('retained reopening resets geometry and restores the new selected row', async ({ page }) => {
    const { errors, trigger, positioner, list } = await setup(page, 'keepMounted:true');
    const handle = await list.elementHandle();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[rdxSelectPopup]')).toBeHidden();
    await trigger.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await expect(positioner).toHaveAttribute('data-side', 'none');
    await expect(page.getByRole('option', { name: 'Item 39', exact: true })).toHaveAttribute('aria-selected', 'true');
    expect(await list.evaluate((el, previous) => el === previous, handle)).toBe(true);
    await inViewport(page);
    expect(errors).toEqual([]);
});

test('in-flow scroll buttons preserve initial selected-text alignment', async ({ page }) => {
    const { errors } = await setup(page, 'initialIndex:18');
    await expect
        .poll(() =>
            page.locator('[rdxSelectValue]').evaluate((value) => {
                const a = value.getBoundingClientRect();
                const b = document
                    .querySelector('[rdxSelectItem][aria-selected="true"] [rdxSelectItemText]')!
                    .getBoundingClientRect();
                return Math.abs(a.top + a.height / 2 - b.top - b.height / 2);
            })
        )
        .toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
});

test('an early close invalidates pending placement before a fresh reopen', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
    });
    await page.setViewportSize({ width: 640, height: 480 });
    await page.goto('/iframe.html?id=primitives-select--sizing-and-fallback&viewMode=story');
    const trigger = page.getByRole('combobox');
    await trigger.press('Enter');
    await page.keyboard.press('F10');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await trigger.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await expect(page.locator('[rdxSelectItemAlignedPosition]')).toHaveAttribute('data-side', 'none');
    await inViewport(page);
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(trigger).toContainText('Item 39');
    expect(errors).toEqual([]);
});
