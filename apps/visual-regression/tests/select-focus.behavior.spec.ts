import { expect, Page, test } from '@playwright/test';

async function example(page: Page, args = ''): Promise<string[]> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    await page.goto(`/iframe.html?id=primitives-select--focus-management&viewMode=story&args=${args}`);
    return errors;
}

async function openSelect(page: Page): Promise<void> {
    await page.getByRole('combobox', { name: 'Fruit' }).press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
}

test('default virtual navigation keeps the documented Tab and focus-out policy', async ({ page }) => {
    const errors = await example(page);
    await openSelect(page);
    await page.keyboard.press('ArrowDown');
    const banana = page.getByRole('option', { name: 'Banana', exact: true });
    await expect(banana).toHaveAttribute('data-highlighted', '');
    await expect(page.locator('[rdxSelectPopup]')).toHaveAttribute(
        'aria-activedescendant',
        (await banana.getAttribute('id')) ?? ''
    );
    await page.keyboard.press('Tab');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.getByTestId('after-select').focus();
    await expect(page.getByTestId('focus-state')).toHaveText('Open');
    expect(errors).toEqual([]);
});

for (const keepMounted of [false, true]) {
    test(`opt-in Tab exits after the trigger and preserves the selected value (keepMounted=${keepMounted})`, async ({
        page
    }) => {
        const errors = await example(page, `closeOnFocusOut:true;keepMounted:${keepMounted}`);
        await openSelect(page);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Tab');
        await expect(page.getByTestId('focus-state')).toHaveText('Closed');
        await expect(page.getByTestId('focus-reason')).toHaveText('focus-out');
        await expect(page.getByTestId('after-select')).toBeFocused();
        await expect(page.getByRole('combobox')).toHaveText('Apple');
        await expect(page.locator('[rdxSelectPopup]')).toHaveCount(keepMounted ? 1 : 0);
        await expect(page.locator('[rdxSelectPopup]')).toBeHidden();
        expect(errors).toEqual([]);
    });

    test(`opt-in Shift+Tab closes back to the trigger (keepMounted=${keepMounted})`, async ({ page }) => {
        const errors = await example(page, `closeOnFocusOut:true;keepMounted:${keepMounted}`);
        await openSelect(page);
        await page.keyboard.press('Shift+Tab');
        await expect(page.getByTestId('focus-state')).toHaveText('Closed');
        await expect(page.getByRole('combobox')).toBeFocused();
        await expect(page.getByTestId('focus-reason')).toHaveText('focus-out');
        expect(errors).toEqual([]);
    });

    test(`Escape and selection return focus on each open (keepMounted=${keepMounted})`, async ({ page }) => {
        const errors = await example(page, `keepMounted:${keepMounted}`);
        for (const key of ['Escape', 'Enter', 'Escape']) {
            await openSelect(page);
            await page.keyboard.press(key);
            await expect(page.getByTestId('focus-state')).toHaveText('Closed');
            await expect(page.getByRole('combobox')).toBeFocused();
        }
        expect(errors).toEqual([]);
    });
}

test('opt-in focus-out preserves an outside focus target', async ({ page }) => {
    const errors = await example(page, 'closeOnFocusOut:true');
    await openSelect(page);
    await page.getByTestId('after-select').focus();
    await expect(page.getByTestId('focus-state')).toHaveText('Closed');
    await expect(page.getByTestId('after-select')).toBeFocused();
    expect(errors).toEqual([]);
});

test('a focus-out close can be canceled without stealing deliberate outside focus', async ({ page }) => {
    const errors = await example(page, 'closeOnFocusOut:true;cancelClose:true');
    await openSelect(page);
    await page.getByTestId('after-select').focus();
    await expect(page.getByTestId('focus-reason')).toHaveText('focus-out');
    await expect(page.getByTestId('focus-state')).toHaveText('Open');
    await expect(page.getByTestId('after-select')).toBeFocused();
    await page.getByTestId('before-select').focus();
    await expect(page.getByTestId('before-select')).toBeFocused();
    expect(errors).toEqual([]);
});

for (const finalFocus of ['after', 'none']) {
    test(`a retained popup honors finalFocus=${finalFocus}`, async ({ page }) => {
        const errors = await example(page, `finalFocus:${finalFocus}`);
        await openSelect(page);
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('focus-complete')).toHaveText('Closed');
        if (finalFocus === 'after') await expect(page.getByTestId('after-select')).toBeFocused();
        else await expect(page.getByRole('combobox')).not.toBeFocused();
        expect(errors).toEqual([]);
    });
}

for (const shell of ['dialog', 'popover']) {
    test(`closing the retained Select preserves its ${shell} and restores nested focus`, async ({ page }) => {
        const errors = await example(page, `shell:${shell};closeOnFocusOut:true`);
        await page.getByRole('button', { name: `Open ${shell}` }).click();
        await expect(page.locator(`[rdx${shell === 'dialog' ? 'Dialog' : 'Popover'}Popup]`)).toBeVisible();
        await openSelect(page);
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('focus-complete')).toHaveText('Closed');
        await expect(page.getByRole('combobox')).toBeFocused();
        await openSelect(page);
        await page.keyboard.press('Tab');
        await expect(page.getByTestId('after-select')).toBeFocused();
        await expect(page.getByTestId('focus-state')).toHaveText('Closed');
        await page.keyboard.press('Escape');
        await expect(page.getByRole('button', { name: `Open ${shell}` })).toBeFocused();
        expect(errors).toEqual([]);
    });
}

test('repositioning an open popup does not take focus back from another control', async ({ page }) => {
    const errors = await example(page);
    await openSelect(page);
    await page.getByTestId('before-select').focus();
    const trigger = page.getByRole('combobox');
    const before = await trigger.boundingBox();
    await page.addStyleTag({ content: 'select-focus-controls { transform: translateX(24px); }' });
    await expect.poll(async () => (await trigger.boundingBox())?.x).toBeGreaterThan(before!.x);
    await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
    await expect(page.getByTestId('before-select')).toBeFocused();
    expect(errors).toEqual([]);
});
