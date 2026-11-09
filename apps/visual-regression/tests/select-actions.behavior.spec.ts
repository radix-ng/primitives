import { expect, Page, test } from '@playwright/test';

async function openExample(page: Page): Promise<string[]> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    await page.goto('/iframe.html?id=primitives-select--deferred-unmount&viewMode=story');
    await expect(page.getByRole('combobox', { name: 'Fruit' })).toBeVisible();
    return errors;
}

async function closeCount(page: Page): Promise<number> {
    return (await page.getByTestId('completions').innerText()).split(',').filter((value) => value.trim() === 'false')
        .length;
}

async function pauseExit(page: Page): Promise<void> {
    await expect(page.getByTestId('phase')).toHaveText('Closing');
    await expect(page.locator('[rdxSelectPopup]')).toHaveAttribute('data-ending-style', '');
    await expect
        .poll(() =>
            page.locator('[rdxSelectPopup]').evaluate((element) => {
                const animations = element.getAnimations();
                // Hold the real animation only in tests that inspect the pending lifecycle.
                animations.forEach((animation) => animation.pause());
                return animations.some((animation) => animation.playState === 'paused');
            })
        )
        .toBe(true);
}

test('imperative close can hold a popup, then manual completion runs once', async ({ page }) => {
    const errors = await openExample(page);
    const trigger = page.getByRole('combobox');
    await trigger.click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByTestId('reason')).toHaveText('imperative-action');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await pauseExit(page);
    await expect(page.locator('[rdxSelectPositioner]')).toHaveAttribute('inert', '');
    expect(await closeCount(page)).toBe(0);
    await page.getByRole('button', { name: 'Finish exit' }).click();
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect(page.getByTestId('phase')).toHaveText('Closed');
    await expect.poll(() => closeCount(page)).toBe(1);
    await page.getByRole('button', { name: 'Finish exit' }).click();
    expect(await closeCount(page)).toBe(1);
    expect(errors).toEqual([]);
});

test('finishing an external exit restores trigger focus and preserves deliberate outside focus', async ({ page }) => {
    const errors = await openExample(page);
    const trigger = page.getByRole('combobox');
    await trigger.click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Escape');
    await pauseExit(page);
    await page
        .locator('[rdxSelectPopup]')
        .evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Escape');
    await pauseExit(page);
    const finish = page.getByRole('button', { name: 'Finish exit' });
    // Explicit outside keyboard focus, independent of Safari's pointer-focus preference.
    await finish.focus();
    await expect(finish).toBeFocused();
    await finish.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect(finish).toBeFocused();
    await expect.poll(() => closeCount(page)).toBe(2);
    expect(errors).toEqual([]);
});

test('canceling an imperative close does not retain the next automatic close', async ({ page }) => {
    const errors = await openExample(page);
    await page.getByLabel('Cancel next close').check();
    await page.getByRole('combobox').click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByTestId('phase')).toHaveText('Open');
    await expect(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(await closeCount(page)).toBe(0);
    await page.getByLabel('Defer unmount').uncheck();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect.poll(() => closeCount(page)).toBe(1);
    expect(errors).toEqual([]);
});

test('reopening interrupts the pending exit and stale unmount calls do not close the live popup', async ({ page }) => {
    const errors = await openExample(page);
    const trigger = page.getByRole('combobox');
    await trigger.click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Escape');
    await pauseExit(page);
    await trigger.click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await expect(page.getByTestId('phase')).toHaveText('Open');
    await expect(page.locator('[rdxSelectPopup]')).toBeVisible();
    await page.getByRole('button', { name: 'Finish exit' }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await closeCount(page)).toBe(0);
    await page.getByLabel('Defer unmount').uncheck();
    await trigger.press('Escape');
    // Escape is handled by the open floating layer even when focus is on its registered trigger.
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect.poll(() => closeCount(page)).toBe(1);
    expect(errors).toEqual([]);
});

test('keepMounted retains a hidden inert view after close completion and reuses it on reopen', async ({ page }) => {
    const errors = await openExample(page);
    await page.getByLabel('Keep mounted').check();
    const trigger = page.getByRole('combobox');
    await trigger.click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Escape');
    await pauseExit(page);
    await page.getByRole('button', { name: 'Finish exit' }).click();
    await expect(page.getByTestId('phase')).toHaveText('Closed');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(1);
    await expect(page.locator('[rdxSelectPopup]')).toBeHidden();
    await expect(page.locator('[rdxSelectPositioner]')).toHaveAttribute('hidden', '');
    await expect(page.locator('[rdxSelectPopup]')).not.toHaveAttribute('data-ending-style');
    await expect(page.getByTestId('mounted')).toHaveText('Mounted');
    await expect.poll(() => closeCount(page)).toBe(1);
    await trigger.click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await expect(page.locator('[rdxSelectPopup]')).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(errors).toEqual([]);
});

for (const keepMounted of [false, true]) {
    test(`deferred exit completes automatically after a canceled close (keepMounted=${keepMounted})`, async ({
        page
    }) => {
        const errors = await openExample(page);
        await page.getByLabel('Defer unmount').check();
        await page.getByLabel('Keep mounted').setChecked(keepMounted);
        await page.getByLabel('Cancel next close').check();
        const trigger = page.getByRole('combobox');
        const popup = page.locator('[rdxSelectPopup]');
        await trigger.click();
        await expect(popup).toBeFocused();
        await page.getByRole('option', { name: 'Banana', exact: true }).click();
        await expect(trigger).toHaveText('Banana');
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(page.getByLabel('Cancel next close')).not.toBeChecked();
        await page.getByRole('option', { name: 'Blueberry', exact: true }).click();
        await expect(trigger).toHaveText('Blueberry');
        await expect(page.getByTestId('phase')).toHaveText('Closed');
        await expect(popup).toBeHidden();
        await expect(popup).toHaveCount(keepMounted ? 1 : 0);
        await expect.poll(() => closeCount(page)).toBe(1);
        await trigger.click();
        await expect(popup).toBeFocused();
        await expect(popup).toHaveCSS('opacity', '1');
        await page.getByRole('option', { name: 'Apple', exact: true }).click();
        await expect(trigger).toHaveText('Apple');
        await expect(popup).toBeHidden();
        await expect.poll(() => closeCount(page)).toBe(2);
        expect(errors).toEqual([]);
    });
}

test('a retained item-aligned view resolves the current selection on every open', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    await page.goto('/iframe.html?id=primitives-select--aligned-position&viewMode=story&args=keepMounted:true');
    const trigger = page.getByRole('combobox');
    const popup = page.locator('[rdxSelectPopup]');
    const positioner = page.locator('[rdxSelectItemAlignedPosition]');
    await expect(trigger).toBeVisible();
    await expect(positioner).toHaveCount(1);
    await expect(positioner).toBeHidden();
    await trigger.click();
    await expect(popup).toBeFocused();
    // Keep a DOM identity marker: this must remain the same Angular view after reopening.
    await popup.evaluate((element) => element.setAttribute('data-retained-view', 'original'));
    await page.getByRole('option', { name: 'Banana', exact: true }).click();
    await expect(trigger).toHaveText('Banana');
    await expect(positioner).toBeHidden();
    await expect(positioner).toHaveAttribute('inert', '');
    await trigger.click();
    await expect(popup).toBeFocused();
    await expect(popup).toHaveAttribute('data-retained-view', 'original');
    await expect(page.getByRole('option', { name: 'Banana', exact: true })).toHaveAttribute('data-highlighted', '');
    await expect
        .poll(async () => {
            const triggerBox = await trigger.boundingBox();
            const itemBox = await page.getByRole('option', { name: 'Banana', exact: true }).boundingBox();
            if (!triggerBox || !itemBox) return Infinity;
            return Math.abs(triggerBox.y + triggerBox.height / 2 - itemBox.y - itemBox.height / 2);
        })
        .toBeLessThan(2);
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Blueberry', exact: true })).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('Escape');
    await expect(positioner).toBeHidden();
    expect(errors).toEqual([]);
});

test('automatic completion waits for a descendant CSS exit', async ({ page }) => {
    const errors = await openExample(page);
    await page.getByLabel('Defer unmount').uncheck();
    await page.addStyleTag({
        content: `
        @keyframes child-exit { from { opacity: 1; } to { opacity: 0; } }
        [rdxSelectPopup][data-closed] [rdxSelectList] { animation: child-exit 10s linear; }
    `
    });
    await page.getByRole('combobox').click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('phase')).toHaveText('Closing');
    expect(await closeCount(page)).toBe(0);
    await expect
        .poll(() => page.locator('[rdxSelectList]').evaluate((element) => element.getAnimations().length))
        .toBe(1);
    await page
        .locator('[rdxSelectList]')
        .evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect.poll(() => closeCount(page)).toBe(1);
    expect(errors).toEqual([]);
});

test('unmount can finish an automatic CSS exit without waiting for it again', async ({ page }) => {
    const errors = await openExample(page);
    await page.getByLabel('Defer unmount').uncheck();
    await page.addStyleTag({
        content: `
        @keyframes long-exit { from { opacity: 1; } to { opacity: 0; } }
        [rdxSelectPopup][data-closed] { animation: long-exit 10s linear; }
    `
    });
    await page.getByRole('combobox').click();
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('phase')).toHaveText('Closing');
    await expect
        .poll(() => page.locator('[rdxSelectPopup]').evaluate((element) => element.getAnimations().length))
        .toBe(1);
    await page.getByRole('button', { name: 'Finish exit' }).click();
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect.poll(() => closeCount(page)).toBe(1);
    expect(errors).toEqual([]);
});
