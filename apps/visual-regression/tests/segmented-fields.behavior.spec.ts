import { expect, Locator, Page, test } from '@playwright/test';

async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await expect(page.locator('#storybook-root [role="group"]')).toBeVisible();
}

function segment(page: Page, part: string): Locator {
    return page.locator(`[data-rdx-date-field-segment="${part}"]`);
}

test('[WCAG 2.4.3] Date Field tabs through its editable segments without an extra input', async ({ page }) => {
    await gotoStory(page, 'primitives-date-field--default');
    const month = segment(page, 'month');
    const day = segment(page, 'day');
    const year = segment(page, 'year');

    await expect(page.locator('[rdxDateFieldRoot] input')).toHaveCount(0);
    await month.focus();
    await month.pressSequentially('06');
    await expect(month).toHaveAttribute('aria-valuenow', '6');
    await day.focus();
    await day.pressSequentially('20');
    await expect(day).toHaveAttribute('aria-valuenow', '20');
    await year.focus();
    await year.pressSequentially('2027');
    await expect(year).toHaveAttribute('aria-valuenow', '2027');

    await month.focus();
    await page.keyboard.press('Tab');
    await expect(day).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(year).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('[rdxDateFieldRoot] :focus')).toHaveCount(0);
    await page.keyboard.press('Shift+Tab');
    await expect(year).toBeFocused();
});

test('[WCAG 2.4.3] Time Field tabs through its editable segments without an extra input', async ({ page }) => {
    await gotoStory(page, 'primitives-time-field--default');
    const hour = segment(page, 'hour');
    const minute = segment(page, 'minute');
    const dayPeriod = segment(page, 'dayPeriod');

    await expect(page.locator('[rdxTimeFieldRoot] input')).toHaveCount(0);
    await hour.focus();
    await hour.pressSequentially('09');
    await expect(hour).toHaveAttribute('aria-valuenow', '9');
    await minute.focus();
    await minute.pressSequentially('30');
    await expect(minute).toHaveAttribute('aria-valuenow', '30');

    await hour.focus();
    await page.keyboard.press('Tab');
    await expect(minute).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dayPeriod).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('[rdxTimeFieldRoot] :focus')).toHaveCount(0);
    await page.keyboard.press('Shift+Tab');
    await expect(dayPeriod).toBeFocused();
});

test('Date Field updates and resets the Signal Forms model through its segments', async ({ page }) => {
    await gotoStory(page, 'primitives-date-field--signal-forms');
    await expect(page.locator('output')).toContainText('No date selected');
    await segment(page, 'month').focus();
    await segment(page, 'month').pressSequentially('06');
    await segment(page, 'day').focus();
    await segment(page, 'day').pressSequentially('20');
    await segment(page, 'year').focus();
    await segment(page, 'year').pressSequentially('2027');
    await expect(page.locator('output')).toContainText('2027-06-20');
    await expect(page.locator('[rdxDateFieldRoot]')).toHaveAttribute('data-dirty', '');
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.locator('output')).toContainText('No date selected');
    await expect(page.locator('[rdxDateFieldRoot]')).not.toHaveAttribute('data-dirty');
});

test('Time Field updates and resets the Signal Forms model through its segments', async ({ page }) => {
    await gotoStory(page, 'primitives-time-field--signal-forms');
    await expect(page.locator('output')).toContainText('No time selected');
    await segment(page, 'hour').focus();
    await segment(page, 'hour').pressSequentially('09');
    await segment(page, 'minute').focus();
    await segment(page, 'minute').pressSequentially('30');
    await expect(page.locator('output')).toContainText('09:30:00');
    await expect(page.locator('[rdxTimeFieldRoot]')).toHaveAttribute('data-dirty', '');
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.locator('output')).toContainText('No time selected');
    await expect(page.locator('[rdxTimeFieldRoot]')).not.toHaveAttribute('data-dirty');
});

test('the native form serializes its hidden value exactly once', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-form--native-controls&viewMode=story');
    const hiddenInput = page.locator('input[type="hidden"][name="hiddenInput"]');
    await expect(hiddenInput).toHaveCount(1);
    await expect(hiddenInput).toBeHidden();
    const entries = await page.locator('form').evaluate((form) => [...new FormData(form as HTMLFormElement).entries()]);
    expect(entries).toEqual([
        ['hiddenInput', 'Hidden value'],
        ['name', 'Ada'],
        ['role', 'Engineer']
    ]);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.locator('form pre')).toHaveText(
        JSON.stringify({ hiddenInput: 'Hidden value', name: 'Ada', role: 'Engineer' }, null, 2)
    );
});
