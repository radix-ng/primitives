import { expect, Page, test } from '@playwright/test';

async function example(page: Page, story: string) {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(`/iframe.html?id=primitives-select--${story}&viewMode=story`);
    const trigger = page.locator('[rdxSelectTrigger]');
    await expect(trigger).toBeVisible();
    return { errors, trigger, popup: page.locator('[rdxSelectPopup]') };
}

test('pressing an open Trigger closes the popup and repeated pointer opens still work', async ({ page }) => {
    const { errors, trigger, popup } = await example(page, 'default');
    await trigger.press('Enter');
    await expect(popup).toBeFocused();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(popup).toBeFocused();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(errors).toEqual([]);
});

test('each outside pointer gesture produces one close request after keyboard opening', async ({ page }) => {
    const { errors, trigger, popup } = await example(page, 'events');
    for (const count of [1, 2]) {
        await trigger.press('Enter');
        await expect(popup).toBeFocused();
        await page.mouse.click(5, 5);
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(page.getByText('open -> false', { exact: true })).toHaveCount(count);
    }
    expect(errors).toEqual([]);
});

test('an anchored popup is centered by default when the trigger and popup have different widths', async ({ page }) => {
    const { errors, trigger, popup } = await example(page, 'default');
    await trigger.evaluate((element) => (element.style.width = '256px'));
    await trigger.press('Enter');
    await expect(popup).toBeFocused();
    await popup.evaluate((element) => {
        element.style.minWidth = '192px';
        element.style.width = '192px';
    });
    await expect
        .poll(async () => {
            const a = await trigger.boundingBox();
            const b = await page.locator('[rdxSelectPositioner]').boundingBox();
            return Math.abs(a!.x + a!.width / 2 - (b!.x + b!.width / 2));
        })
        .toBeLessThan(2);
    expect(errors).toEqual([]);
});
