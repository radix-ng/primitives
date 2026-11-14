import { expect, test, type Page } from '@playwright/test';

// These are maintained consumer integration fixtures, not independent agent-generation runs.
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
    const messages: string[] = [];
    errors.set(page, messages);
    page.on('pageerror', (error) => messages.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') messages.push(message.text());
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Radix NG consumer integration' })).toBeVisible();
});
test.afterEach(({ page }) => expect(errors.get(page), 'consumer browser errors').toEqual([]));

// macOS WebKit uses Option+Tab for native full-keyboard navigation.
const tabKey = (browserName: string) => (browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');

test('labelled Reactive Form reflects validation, dirty and touched state', async ({ page, browserName }) => {
    const email = page.getByRole('textbox', { name: 'Email', exact: true });
    await expect(email).toHaveAccessibleDescription('Use the email connected to your account.');
    await expect(email).toHaveAttribute('required', '');
    await email.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Email is required.', { exact: true })).toBeVisible();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    const errorId = await page.getByText('Email is required.', { exact: true }).getAttribute('id');
    expect((await email.getAttribute('aria-describedby'))?.split(' ')).toContain(errorId);
    await email.fill('invalid');
    const tab = tabKey(browserName);
    await page.keyboard.press(tab);
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeFocused();
    await expect(email).toHaveAttribute('data-dirty', '');
    await expect(email).toHaveAttribute('data-touched', '');
    await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeVisible();
    await email.fill('reader@example.com');
    await page.keyboard.press(tab);
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeHidden();
});

test('Select inside Dialog commits a value and dismisses layers in keyboard order', async ({ page, browserName }) => {
    const trigger = page.getByRole('button', { name: 'Open dialog', exact: true });
    await trigger.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Choose a fruit', exact: true });
    await expect(dialog).toBeVisible();
    const select = page.getByRole('combobox', { name: 'Fruit', exact: true });
    await select.press('Enter');
    const popup = page.getByRole('listbox');
    await expect(popup).toBeFocused();
    await expect(page.getByRole('option', { name: 'Apple', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(select).toHaveText('Banana');
    await expect(select).toBeFocused();
    await expect(page.getByRole('status', { name: 'Selected fruit' })).toHaveText('Banana');
    await select.press('Enter');
    await expect(popup).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden();
    await expect(select).toBeFocused();
    await expect(dialog).toBeVisible();
    const tab = tabKey(browserName);
    for (const key of [`Shift+${tab}`, tab, tab]) {
        await page.keyboard.press(key);
        await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.press('Enter');
    await expect(page.getByRole('combobox', { name: 'Fruit', exact: true })).toHaveText('Banana');
});

test('Menu hands focus to Dialog through exit and restores its trigger after Escape or Cancel', async ({
    page,
    browserName
}) => {
    const trigger = page.getByRole('button', { name: 'Document actions', exact: true });
    for (const close of ['Escape', 'Cancel']) {
        await trigger.press('Enter');
        await expect(page.getByRole('menuitem', { name: 'Rename document…', exact: true })).toBeFocused();
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog', { name: 'Rename document', exact: true });
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAccessibleDescription('Focus stays in this dialog while the menu finishes closing.');
        const name = page.getByRole('textbox', { name: 'Document name', exact: true });
        await expect(name).toBeFocused();
        await expect(page.locator('[rdxMenuPopup]')).toBeHidden();
        await expect(name).toBeFocused();
        const tab = tabKey(browserName);
        for (const key of [`Shift+${tab}`, tab, tab]) {
            await page.keyboard.press(key);
            await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
        }
        if (close === 'Escape') await page.keyboard.press('Escape');
        else await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
    }
});

test('hostDirectives Tabs wrapper preserves projected context, bindings and manual activation', async ({ page }) => {
    const account = page.getByRole('tab', { name: 'Account', exact: true });
    const password = page.getByRole('tab', { name: 'Password', exact: true });
    const team = page.getByRole('tab', { name: 'Team', exact: true });
    const list = page.getByRole('tablist', { name: 'Account settings' });
    await expect(account).toHaveAttribute('aria-selected', 'true');
    await expect(list.locator('[tabindex="0"]')).toHaveCount(1);
    await expect(page.getByRole('tabpanel', { name: 'Account' })).toBeVisible();
    const panelId = await page.getByRole('tabpanel', { name: 'Account' }).getAttribute('id');
    await expect(account).toHaveAttribute('aria-controls', panelId!);
    await account.focus();
    await page.keyboard.press('ArrowRight');
    await expect(password).toBeFocused();
    await expect(account).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tabpanel', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Active tab' })).toHaveText('password');
    await page.keyboard.press('Home');
    await expect(account).toBeFocused();
    await page.keyboard.press('End');
    await expect(team).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByRole('tabpanel', { name: 'Team' })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Active tab' })).toHaveText('team');
    await expect(list.locator('[aria-selected="true"]')).toHaveCount(1);
    await expect(list.locator('[tabindex="0"]')).toHaveCount(1);
    await page.keyboard.press('Tab');
    await expect.poll(() => list.evaluate((element) => element.contains(document.activeElement))).toBe(false);
});
