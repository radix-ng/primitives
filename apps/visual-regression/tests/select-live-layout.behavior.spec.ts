import { expect, Page, test } from '@playwright/test';

async function setup(page: Page, args = '', open = true) {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
    });
    await page.setViewportSize({ width: 640, height: 480 });
    await page.goto(`/iframe.html?id=primitives-select--live-layout&viewMode=story&args=${args}`);
    const trigger = page.getByRole('combobox');
    const popup = page.locator('[rdxSelectPopup]');
    const positioner = page.locator('[data-radix-popper-content-wrapper]');
    if (open) {
        await trigger.press('Enter');
        await expect(popup).toBeFocused();
    }
    return { errors, trigger, popup, positioner };
}
async function gap(page: Page) {
    await expect
        .poll(() =>
            page.getByRole('combobox').evaluate((el) => {
                const trigger = el.getBoundingClientRect();
                const p = document.querySelector('[rdxSelectPopup]')!.getBoundingClientRect();
                const distance =
                    document.querySelector('[data-radix-popper-content-wrapper]')!.getAttribute('data-side') === 'top'
                        ? trigger.top - p.bottom
                        : p.top - trigger.bottom;
                return Math.abs(distance - 5);
            })
        )
        .toBeLessThanOrEqual(2);
}
async function alignedText(page: Page) {
    await expect
        .poll(() =>
            page.locator('[rdxSelectValue]').evaluate((el) => {
                const value = el.getBoundingClientRect();
                const selected = document
                    .querySelector('[aria-selected="true"] [rdxSelectItemText]')!
                    .getBoundingClientRect();
                return Math.abs(value.top + value.height / 2 - selected.top - selected.height / 2);
            })
        )
        .toBeLessThanOrEqual(2);
}

test('anchored Select follows live width, translation, scale and row changes', async ({ page }) => {
    const { errors, trigger, positioner } = await setup(page);
    for (const key of ['F2', 'F6', 'F4', 'F3']) {
        await page.keyboard.press(key);
        await expect
            .poll(async () => Math.abs((await positioner.boundingBox())!.width - (await trigger.boundingBox())!.width))
            .toBeLessThanOrEqual(2);
        await gap(page);
    }
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(trigger).toContainText('Item 39');
    expect(errors).toEqual([]);
});

test('disabled tracking freezes the anchor and remeasures a tall list on reopening', async ({ page }) => {
    const { errors, trigger, positioner, popup } = await setup(page, 'tracking:off');
    const initial = (await positioner.boundingBox())!;
    for (const key of ['F2', 'F6', 'F4', 'F3']) await page.keyboard.press(key);
    await expect.poll(() => trigger.evaluate((el) => el.getBoundingClientRect().width)).toBe(400);
    const frozen = (await positioner.boundingBox())!;
    expect(frozen.x).toBe(initial.x);
    expect(frozen.y).toBe(initial.y);
    expect(frozen.width).toBe(initial.width);
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(popup).toBeHidden();
    await trigger.press('Enter');
    await expect(popup).toBeFocused();
    await gap(page);
    expect(errors).toEqual([]);
});

test('item alignment retains opening geometry and realigns after reopening', async ({ page }) => {
    const { errors, trigger, positioner, popup } = await setup(page, 'aligned:true');
    const initial = (await positioner.boundingBox())!;
    await page.keyboard.press('F2');
    await page.keyboard.press('F6');
    await expect.poll(() => trigger.evaluate((el) => el.getBoundingClientRect().width)).toBe(320);
    const frozen = (await positioner.boundingBox())!;
    expect(frozen.x).toBe(initial.x);
    expect(frozen.y).toBe(initial.y);
    expect(frozen.width).toBe(initial.width);
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(popup).toBeHidden();
    await trigger.press('Enter');
    await expect(popup).toBeFocused();
    await alignedText(page);
    expect(errors).toEqual([]);
});

test('opt-in item tracking refreshes metrics without moving the manual coordinates', async ({ page }) => {
    const { errors, trigger, positioner } = await setup(page, 'aligned:true;tracking:on');
    const initial = (await positioner.boundingBox())!;
    for (const key of ['F2', 'F6', 'F4']) await page.keyboard.press(key);
    await expect.poll(() => positioner.evaluate((el) => el.getBoundingClientRect().width)).toBe(400);
    const current = (await positioner.boundingBox())!;
    expect(current.x).toBe(initial.x);
    expect(current.y).toBe(initial.y);
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(trigger).toContainText('Item 39');
    expect(errors).toEqual([]);
});

test('CSS-scaled trigger keeps native item text alignment', async ({ page }) => {
    const { errors, trigger, popup } = await setup(page, 'aligned:true', false);
    await page.keyboard.press('F4');
    await trigger.press('Enter');
    await expect(popup).toBeFocused();
    await alignedText(page);
    expect(errors).toEqual([]);
});

test('an initially unmeasurable trigger can acquire item alignment after layout becomes available', async ({
    page
}) => {
    const { errors, trigger, popup } = await setup(page, 'aligned:true', false);
    await trigger.evaluate((el) => {
        el.style.height = '0px';
        el.style.paddingBlock = '0px';
        el.style.borderBlockWidth = '0px';
    });
    await trigger.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.evaluate((el) => {
        el.style.removeProperty('height');
        el.style.removeProperty('padding-block');
        el.style.removeProperty('border-block-width');
    });
    await expect(popup).toBeFocused();
    await alignedText(page);
    expect(errors).toEqual([]);
});

test('a scaled item-aligned portal uses usable anchored fallback', async ({ page }) => {
    const { errors, trigger, positioner } = await setup(page, 'aligned:true;portalScale:true');
    await expect(positioner).not.toHaveAttribute('data-side', 'none');
    await gap(page);
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(trigger).toContainText('Item 39');
    expect(errors).toEqual([]);
});

for (const hide of [false, true])
    test(`clipping state tracks the anchor with hideWhenDetached=${hide}`, async ({ page }) => {
        const { errors, trigger, positioner, popup } = await setup(page, `scrollable:true;hideWhenDetached:${hide}`);
        const scroller = page.getByTestId('live-scroller');
        const rect = (await scroller.boundingBox())!;
        // Use top padding: fixed demo controls can cover the bottom under Linux font metrics.
        const point = { x: rect.x + rect.width - 20, y: rect.y + 10 };
        expect(
            await scroller.evaluate(
                (el, point) => el.contains(el.ownerDocument.elementFromPoint(point.x, point.y)),
                point
            )
        ).toBe(true);
        await page.mouse.move(point.x, point.y);
        await expect
            .poll(
                async () => {
                    await page.mouse.wheel(0, 20);
                    return (await trigger.boundingBox())!.y + (await trigger.boundingBox())!.height < rect.y;
                },
                { intervals: [100] }
            )
            .toBe(true);
        await expect(positioner).toHaveAttribute('data-anchor-hidden', '');
        if (hide) await expect(popup).toBeHidden();
        else await expect(popup).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect
            .poll(
                async () => {
                    await page.mouse.wheel(0, -40);
                    return scroller.evaluate((el) => el.scrollTop);
                },
                { intervals: [100] }
            )
            .toBe(0);
        await expect(positioner).not.toHaveAttribute('data-anchor-hidden', '');
        await expect(popup).toBeVisible();
        expect(errors).toEqual([]);
    });
