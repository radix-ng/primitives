import { expect, Page, test } from '@playwright/test';

async function gotoStory(page: Page, storyId: string): Promise<string[]> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('console', (message) => {
        // Storybook's static preview has no favicon.ico; ignore only that expected 404.
        const missingFavicon = message.text().includes('404') && message.location().url.endsWith('/favicon.ico');
        if (message.type() === 'error' && !missingFavicon) errors.push(message.text());
    });
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
    return errors;
}

const slot = '[rdxOtpFieldInput]';
const readCode = (page: Page) =>
    page.locator(slot).evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value).join(''));

test.describe('OTP Field behavior', () => {
    test('moves focus while typing and rejects characters outside numeric validation', async ({ page }) => {
        const errors = await gotoStory(page, 'primitives-otp-field--default');
        const slots = page.locator(slot);

        await expect(slots).toHaveCount(6);
        await expect(slots.nth(0)).toHaveAttribute('autocomplete', 'one-time-code');
        await expect(slots.nth(1)).toHaveAttribute('autocomplete', 'off');
        await slots.nth(5).focus();
        await expect(slots.nth(0)).toBeFocused();
        await slots.nth(0).focus();
        await page.keyboard.type('123456');
        await expect.poll(() => readCode(page)).toBe('123456');
        await expect(slots.nth(5)).toBeFocused();

        await slots.nth(1).focus();
        await page.keyboard.type('9');
        await expect.poll(() => readCode(page)).toBe('193456');

        await slots.nth(0).fill('x');
        await expect(slots.nth(0)).toHaveValue('1');
        expect(errors).toEqual([]);
    });

    test('distributes a paste and navigates across visually grouped slots', async ({ page }) => {
        const errors = await gotoStory(page, 'primitives-otp-field--groups-and-separator');
        const slots = page.locator(slot);

        await expect(slots).toHaveCount(8);
        await expect(page.locator('[rdxOtpFieldSeparator]')).toHaveAttribute('role', 'separator');
        await slots.nth(0).evaluate((element) => {
            const clipboard = new DataTransfer();
            clipboard.setData('text/plain', 'AB12-CD34');
            element.dispatchEvent(
                new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: clipboard })
            );
        });
        await expect.poll(() => readCode(page)).toBe('AB12CD34');
        await expect(slots.nth(7)).toBeFocused();

        await slots.nth(4).focus();
        await page.keyboard.press('Home');
        await expect(slots.nth(0)).toBeFocused();
        await page.keyboard.press('End');
        await expect(slots.nth(7)).toBeFocused();
        expect(errors).toEqual([]);
    });
});
