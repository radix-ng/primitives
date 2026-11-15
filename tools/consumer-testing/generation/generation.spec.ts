import { expect, test, type Locator, type Page } from '@playwright/test';

const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
    const collected: string[] = [];
    errors.set(page, collected);
    page.on('pageerror', (error) => collected.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') collected.push(message.text());
    });
});
test.afterEach(({ page }) => expect(errors.get(page), 'application browser errors').toEqual([]));

async function openSelect(page: Page, trigger: Locator) {
    await trigger.press('Enter');
    const popup = page.getByRole('listbox');
    await expect(popup).toBeVisible();
    await expect.poll(() => popup.evaluate((element) => element.contains(document.activeElement))).toBe(true);
}
async function settled(page: Page) {
    await expect
        .poll(() =>
            page
                .locator('[rdxSelectPopup], [rdxDialogPopup]')
                .evaluateAll(
                    (elements) =>
                        elements
                            .flatMap((element) => element.getAnimations({ subtree: true }))
                            .filter((animation) => animation.playState === 'running').length
                )
        )
        .toBe(0);
}

test('generated Dialog composition preserves selection, nested Escape and focus ownership', async ({ page }) => {
    await page.goto('/');
    const open = page.getByRole('button', { name: 'Open project settings', exact: true });
    const dialog = page.getByRole('dialog', { name: 'Project settings', exact: true });
    await expect(page.getByTestId('selected-value')).toHaveText('private');
    await open.press('Enter');
    await expect(dialog).toBeVisible();
    const select = page.getByRole('combobox', { name: 'Visibility', exact: true });
    await expect(select).toContainText('Private');
    await openSelect(page, select);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(select).toContainText('Public');
    await expect(page.getByTestId('selected-value')).toHaveText('public');
    await expect(page.getByRole('listbox')).toBeHidden();
    await settled(page);
    await expect(select).toBeFocused();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Done', exact: true }).press('Enter');
    await expect(dialog).toBeHidden();
    await settled(page);
    await expect(open).toBeFocused();

    await open.press('Enter');
    await expect(select).toContainText('Public');
    for (const key of ['Tab', 'Shift+Tab']) {
        await page.keyboard.press(key);
        await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    }
    await openSelect(page, select);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(dialog).toBeVisible();
    await settled(page);
    await expect(select).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await settled(page);
    await expect(page.locator('html')).not.toHaveAttribute('data-rdx-scroll-locked');
    await expect(open).toBeFocused();
    await page.getByRole('button', { name: 'Set Private externally', exact: true }).click();
    await expect(page.getByTestId('selected-value')).toHaveText('private');
    await open.click();
    await expect(select).toContainText('Private');
});

test('generated application respects externally bound disabled and resumes selection', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('checkbox', { name: 'Disable selection', exact: true }).check();
    await page.getByRole('button', { name: 'Set Public externally', exact: true }).click();
    await page.getByRole('button', { name: 'Open project settings', exact: true }).click();
    const trigger = page.getByRole('combobox', { name: 'Visibility', exact: true });
    await expect(trigger).toContainText('Public');
    await expect(trigger).toBeDisabled();
    await trigger.press('Enter');
    await trigger.click({ force: true });
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(page.getByTestId('selected-value')).toHaveText('public');
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Disable selection', exact: true }).uncheck();
    await page.getByRole('button', { name: 'Set Private externally', exact: true }).click();
    await page.getByRole('button', { name: 'Open project settings', exact: true }).click();
    await openSelect(page, trigger);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('selected-value')).toHaveText('public');
});

test('independent parent verifies AppSelect public bindings, callback payload/count and accessible name', async ({
    page
}) => {
    const port = Number(process.env['RADIX_GENERATION_PORT'] ?? 4501);
    await page.goto(`http://localhost:${port + 1}/`);
    const trigger = page.getByRole('combobox', { name: 'Review visibility', exact: true });
    await expect(trigger).toContainText('Private');
    await page.getByRole('button', { name: 'Set Public externally', exact: true }).click();
    await expect(trigger).toContainText('Public');
    await page.getByRole('button', { name: 'Set Private externally', exact: true }).click();
    await expect(trigger).toContainText('Private');
    await expect(page.getByTestId('event-count')).toHaveText('0');
    await openSelect(page, trigger);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('selected-value')).toHaveText('public');
    await expect(page.getByTestId('event-count')).toHaveText('1');
    await expect(page.getByTestId('event-payload')).toHaveText('public');
    await expect(trigger).toBeFocused();
    await page.getByRole('button', { name: 'Change accessible name', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Deployment visibility', exact: true })).toBeVisible();
});

test('independent parent verifies disabled blocks keyboard/pointer and accepts external values', async ({ page }) => {
    const port = Number(process.env['RADIX_GENERATION_PORT'] ?? 4501);
    await page.goto(`http://localhost:${port + 1}/`);
    const trigger = page.getByRole('combobox', { name: 'Review visibility', exact: true });
    await page.getByRole('checkbox', { name: 'Disable selection', exact: true }).check();
    await expect(trigger).toBeDisabled();
    await trigger.press('Enter');
    await trigger.click({ force: true });
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(page.getByTestId('selected-value')).toHaveText('private');
    await expect(page.getByTestId('event-count')).toHaveText('0');
    await page.getByRole('button', { name: 'Set Public externally', exact: true }).click();
    await expect(trigger).toContainText('Public');
    await expect(page.getByTestId('event-count')).toHaveText('0');
    await page.getByRole('checkbox', { name: 'Disable selection', exact: true }).uncheck();
    await page.getByRole('button', { name: 'Set Private externally', exact: true }).click();
    await openSelect(page, trigger);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('selected-value')).toHaveText('public');
    await expect(page.getByTestId('event-count')).toHaveText('1');
});
