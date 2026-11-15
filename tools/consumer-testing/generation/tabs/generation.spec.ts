// Checks version: tabs-consumer/1. Frozen before the live coding session.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { navigationKey } from '../cross-browser/keyboard';

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

function parts(page: Page, instance: 'primary' | 'secondary') {
    const wrapper = page.getByTestId(`${instance}-tabs`);
    return {
        wrapper,
        list: wrapper.getByRole('tablist'),
        account: wrapper.getByRole('tab', { name: 'Account', exact: true }),
        billing: wrapper.getByRole('tab', { name: 'Billing', exact: true }),
        security: wrapper.getByRole('tab', { name: 'Security', exact: true })
    };
}

async function selected(wrapper: Locator, label: string) {
    await expect(wrapper.getByRole('tab', { name: label, exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(wrapper.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1);
    await expect(wrapper.getByRole('tabpanel')).toHaveCount(1);
    await expect(wrapper.getByRole('tabpanel', { name: label, exact: true })).toBeVisible();
}

async function callback(page: Page, instance: string, count: number, value: string) {
    await expect(page.getByTestId(`${instance}-value`)).toHaveText(value);
    await expect(page.getByTestId(`${instance}-event-count`)).toHaveText(String(count));
    if (count) {
        await expect(page.getByTestId(`${instance}-event-value`)).toHaveText(value);
        await expect(page.getByTestId(`${instance}-event-reason`)).toHaveText('none');
    }
}

async function relationships(page: Page) {
    const ids: string[] = [];
    for (const instance of ['primary', 'secondary'] as const) {
        const { wrapper, list } = parts(page, instance);
        await expect(list.getByRole('tab')).toHaveCount(3);
        const tabs = await list.getByRole('tab').evaluateAll((elements) =>
            elements.map((element) => ({
                id: element.id,
                controls: element.getAttribute('aria-controls'),
                name: element.textContent?.trim()
            }))
        );
        const panels = await wrapper.locator('[role="tabpanel"]').evaluateAll((elements) =>
            elements.map((element) => ({
                id: element.id,
                labelledBy: element.getAttribute('aria-labelledby')
            }))
        );
        expect(panels).toHaveLength(3);
        for (const tab of tabs) {
            expect(tab.id).toBeTruthy();
            expect(tab.controls).toBeTruthy();
            expect(tab.name).toBeTruthy();
            expect(panels.find((panel) => panel.id === tab.controls)?.labelledBy).toBe(tab.id);
        }
        ids.push(...tabs.map((tab) => tab.id), ...panels.map((panel) => panel.id));
    }
    expect(new Set(ids).size).toBe(12);
    return ids;
}

for (const host of [
    {
        name: 'generated application',
        offset: 0,
        primaryLabel: 'Primary sections',
        secondaryLabel: 'Secondary sections',
        primaryContent: 'Primary account content'
    },
    {
        name: 'independent parent',
        offset: 1,
        primaryLabel: 'Billing sections',
        secondaryLabel: 'Shipping sections',
        primaryContent: 'Independent primary account content'
    }
]) {
    test.describe(host.name, () => {
        test.beforeEach(async ({ page }) => {
            const port = Number(process.env['RADIX_GENERATION_PORT'] ?? 4561);
            await page.goto(`http://localhost:${port + host.offset}/`);
        });

        test('projected DI, roles/names, panel visibility and instance-scoped ids', async ({ page }) => {
            const primary = parts(page, 'primary');
            const secondary = parts(page, 'secondary');
            await expect(primary.list).toHaveAccessibleName(host.primaryLabel);
            await expect(secondary.list).toHaveAccessibleName(host.secondaryLabel);
            await selected(primary.wrapper, 'Account');
            await selected(secondary.wrapper, 'Account');
            await expect(primary.wrapper.getByRole('tabpanel')).toContainText(host.primaryContent);
            await relationships(page);
            await callback(page, 'primary', 0, 'account');
            await callback(page, 'secondary', 0, 'account');
        });

        test('manual arrows and Home/End move focus; Enter/Space activate once with native payload', async ({
            page
        }) => {
            const p = parts(page, 'primary');
            await p.account.focus();
            for (const [key, target] of [
                ['ArrowRight', p.billing],
                ['ArrowRight', p.security],
                ['Home', p.account],
                ['End', p.security]
            ] as const) {
                await page.keyboard.press(key);
                await expect(target).toBeFocused();
                await selected(p.wrapper, 'Account');
                await callback(page, 'primary', 0, 'account');
            }
            await page.keyboard.press('Enter');
            await selected(p.wrapper, 'Security');
            await callback(page, 'primary', 1, 'security');
            await page.keyboard.press('Enter');
            await callback(page, 'primary', 1, 'security');
            await page.keyboard.press('ArrowLeft');
            await expect(p.billing).toBeFocused();
            await selected(p.wrapper, 'Security');
            await page.keyboard.press('Home');
            await expect(p.account).toBeFocused();
            await selected(p.wrapper, 'Security');
            await page.keyboard.press('Space');
            await selected(p.wrapper, 'Account');
            await callback(page, 'primary', 2, 'account');
        });

        test('disabled Tabs receive arrow focus and refuse Enter/Space/pointer activation', async ({ page }) => {
            const p = parts(page, 'primary');
            await expect(p.billing).toHaveAttribute('aria-disabled', 'true');
            await p.account.focus();
            await page.keyboard.press('ArrowRight');
            await expect(p.billing).toBeFocused();
            for (const key of ['Enter', 'Space']) {
                await page.keyboard.press(key);
                await expect(p.billing).toBeFocused();
                await selected(p.wrapper, 'Account');
                await callback(page, 'primary', 0, 'account');
            }
            await p.billing.click({ force: true });
            await selected(p.wrapper, 'Account');
            await callback(page, 'primary', 0, 'account');
            await p.account.focus();
            await page.keyboard.press('ArrowRight');
            await expect(p.billing).toBeFocused();
            await page.keyboard.press('ArrowRight');
            await expect(p.security).toBeFocused();
            await page.keyboard.press('Enter');
            await selected(p.wrapper, 'Security');
            await callback(page, 'primary', 1, 'security');
        });

        test('external selected values render without callbacks and preserve ids', async ({ page }) => {
            const before = await relationships(page);
            await page.getByRole('button', { name: 'Set primary Security externally', exact: true }).click();
            await selected(parts(page, 'primary').wrapper, 'Security');
            await selected(parts(page, 'secondary').wrapper, 'Account');
            await callback(page, 'primary', 0, 'security');
            await callback(page, 'secondary', 0, 'account');
            await page.getByRole('button', { name: 'Set primary Account externally', exact: true }).click();
            await selected(parts(page, 'primary').wrapper, 'Account');
            await callback(page, 'primary', 0, 'account');
            await page.getByRole('button', { name: 'Set secondary Security externally', exact: true }).click();
            await selected(parts(page, 'secondary').wrapper, 'Security');
            await callback(page, 'secondary', 0, 'security');
            expect(await relationships(page)).toEqual(before);
        });

        test('two projected wrappers isolate selection, callbacks, associations and keyboard focus', async ({
            page
        }) => {
            const first = parts(page, 'primary');
            const second = parts(page, 'secondary');
            await first.account.focus();
            await page.keyboard.press('End');
            await expect(first.security).toBeFocused();
            await page.keyboard.press('Enter');
            await selected(first.wrapper, 'Security');
            await selected(second.wrapper, 'Account');
            await callback(page, 'primary', 1, 'security');
            await callback(page, 'secondary', 0, 'account');
            await second.account.focus();
            await page.keyboard.press('ArrowRight');
            await expect(second.billing).toBeFocused();
            await selected(first.wrapper, 'Security');
            await selected(second.wrapper, 'Account');
            await page.keyboard.press('End');
            await expect(second.security).toBeFocused();
            await page.keyboard.press('Enter');
            await callback(page, 'primary', 1, 'security');
            await callback(page, 'secondary', 1, 'security');
            await first.security.focus();
            await page.keyboard.press('Home');
            await expect(first.account).toBeFocused();
            await page.keyboard.press('Space');
            await selected(first.wrapper, 'Account');
            await selected(second.wrapper, 'Security');
            await callback(page, 'primary', 2, 'account');
            await callback(page, 'secondary', 1, 'security');
            await relationships(page);
        });

        test('Tab leaves the list for its selected panel and Shift+Tab returns to its selected tab', async ({
            page,
            browserName
        }) => {
            const p = parts(page, 'primary');
            await p.account.focus();
            await page.keyboard.press(navigationKey('Tab', browserName));
            await expect(p.wrapper.getByRole('tabpanel', { name: 'Account', exact: true })).toBeFocused();
            await page.keyboard.press(navigationKey('Shift+Tab', browserName));
            await expect(p.account).toBeFocused();
            await page.keyboard.press('End');
            await expect(p.security).toBeFocused();
            await page.keyboard.press('Enter');
            await page.keyboard.press(navigationKey('Tab', browserName));
            await expect(p.wrapper.getByRole('tabpanel', { name: 'Security', exact: true })).toBeFocused();
            await page.keyboard.press(navigationKey('Shift+Tab', browserName));
            await expect(p.security).toBeFocused();
            await callback(page, 'primary', 1, 'security');
        });
    });
}
