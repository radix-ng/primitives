import { expect, Page, test } from '@playwright/test';

async function setup(page: Page, keepMounted = false) {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(`/iframe.html?id=primitives-select--typeahead&viewMode=story&args=keepMounted:${keepMounted}`);
    const trigger = page.locator('[rdxSelectTrigger]');
    await expect(trigger).toBeVisible();
    return { errors, trigger, popup: page.locator('[rdxSelectPopup]'), selected: page.getByTestId('typeahead-value') };
}
const option = (page: Page, text: string) => page.getByRole('option', { name: text, exact: true });

test('Select Typeahead story searches multiword labels without committing on Space', async ({ page }) => {
    const { errors, trigger, popup, selected } = await setup(page);
    await trigger.press('Enter');
    await expect(popup).toBeFocused();
    await page.keyboard.type('new y');
    await expect(option(page, 'New York')).toHaveAttribute('data-highlighted', '');
    await expect(popup).toBeVisible();
    await expect(selected).toContainText('amsterdam');
    await page.keyboard.press('Enter');
    await expect(popup).toBeHidden();
    await expect(trigger).toContainText('New York');
    await expect(selected).toContainText('new-york');
    expect(errors).toEqual([]);
});

test('Select Typeahead story cycles initials and resets after a pause', async ({ page }) => {
    const { errors, trigger, popup } = await setup(page);
    await page.clock.install();
    await trigger.press('Enter');
    await expect(popup).toBeFocused();
    await page.keyboard.press('b');
    await expect(option(page, 'Berlin')).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('b');
    await expect(option(page, 'Bern')).toHaveAttribute('data-highlighted', '');
    await page.clock.runFor(800);
    await page.keyboard.press('n');
    await expect(option(page, 'New York')).toHaveAttribute('data-highlighted', '');
    await page.clock.runFor(800);
    await page.keyboard.press('Space');
    await expect(popup).toBeHidden();
    await expect(trigger).toContainText('New York');
    expect(errors).toEqual([]);
});

test('Select Typeahead story clears retained-view searches and keeps disabled options unselectable', async ({
    page
}) => {
    const { errors, trigger, popup, selected } = await setup(page, true);
    await page.clock.install();
    await trigger.press('Enter');
    await expect(popup).toBeFocused();
    await page.keyboard.press('n');
    await expect(option(page, 'New York')).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden();
    await expect(popup).toHaveCount(1);
    await trigger.press('Enter');
    await expect(popup).toBeFocused();
    await page.keyboard.press('b');
    await expect(option(page, 'Berlin')).toHaveAttribute('data-highlighted', '');
    await page.clock.runFor(800);
    await page.keyboard.press('End');
    await expect(option(page, 'Tokyo')).toHaveAttribute('aria-disabled', 'true');
    await expect(option(page, 'Tokyo')).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(popup).toBeVisible();
    await expect(selected).toContainText('amsterdam');
    await page.keyboard.press('b');
    await expect(option(page, 'Tokyo')).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('b');
    await expect(option(page, 'Berlin')).toHaveAttribute('data-highlighted', '');
    expect(errors).toEqual([]);
});

test('closed Select typeahead selects multiword labels without opening or stealing focus', async ({ page }) => {
    const { errors, trigger, popup, selected } = await setup(page);
    await trigger.focus();
    await expect(popup).toHaveCount(0);
    const overflow = await page.evaluate(() => document.body.style.overflow);
    await page.keyboard.type('new y');
    await expect(trigger).toContainText('New York');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
    await expect(popup).toBeHidden();
    await expect(selected).toContainText('new-york');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe(overflow);
    await page.getByText('In the open list, typing only highlights', { exact: false }).click();
    await expect(popup).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('closed Select typeahead releases its temporary view and idle Space opens normally', async ({ page }) => {
    const { errors, trigger, popup } = await setup(page);
    await page.clock.install();
    await trigger.focus();
    await page.keyboard.press('b');
    await expect(trigger).toContainText('Berlin');
    await page.keyboard.press('b');
    await expect(trigger).toContainText('Bern');
    await page.clock.runFor(800);
    await expect(popup).toHaveCount(0);
    await page.keyboard.press('Space');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(popup).toBeFocused();
    await expect(option(page, 'Bern')).toHaveAttribute('data-highlighted', '');
    expect(errors).toEqual([]);
});
