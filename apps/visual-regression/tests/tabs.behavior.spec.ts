import { expect, test } from '@playwright/test';

test('Tabs two-way controlled binding accepts requests and respects cancellation', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-tabs--controlled&viewMode=story');
    const account = page.getByRole('tab', { name: 'Account' });
    const security = page.getByRole('tab', { name: 'Security' });
    await expect(account).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('checkbox', { name: 'Block changes' }).check();
    await security.press('Enter');
    await expect(account).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('controlled-value')).toHaveText('Selected: account');
    await expect(page.getByTestId('controlled-requests')).toHaveText('Requests: 1');
    await page.getByRole('checkbox', { name: 'Block changes' }).uncheck();
    await security.press('Enter');
    await expect(security).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('controlled-value')).toHaveText('Selected: security');
    await expect(page.getByTestId('controlled-requests')).toHaveText('Requests: 2');
    await expect(page.getByRole('tabpanel')).toHaveText('Update your security preferences.');
    expect(errors).toEqual([]);
});

test('Tabs object values preserve typed application state and whole-Panel presence', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-tabs--object-values&viewMode=story');
    const account = page.getByRole('tab', { name: 'Account' });
    const security = page.getByRole('tab', { name: 'Security' });
    await expect(account).toHaveAttribute('aria-selected', 'true');
    await account.focus();
    await page.keyboard.press('ArrowRight');
    await expect(security).toBeFocused();
    await expect(account).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(security).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('output')).toHaveText('Selected: Security');
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    await expect(page.getByRole('tabpanel')).toHaveText('Update your security preferences.');
    expect(errors).toEqual([]);
});

test('Tabs public indicator follows the selected Tab through its CSS transition', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-tabs--indicator&viewMode=story');
    const indicator = page.locator('[rdxTabsIndicator]');
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('role', 'presentation');
    for (const name of ['Overview', 'Activity', 'Settings', 'Overview']) {
        const tab = page.getByRole('tab', { name, exact: true });
        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        await expect
            .poll(async () => {
                const [active, rendered] = await Promise.all([tab.boundingBox(), indicator.boundingBox()]);
                if (!active || !rendered) return Infinity;
                return Math.max(Math.abs(active.x - rendered.x), Math.abs(active.width - rendered.width));
            })
            .toBeLessThan(0.05);
    }
    expect(errors).toEqual([]);
});

test('Tabs keyframe exit destroys the whole Panel view and recreates it on return', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto('/iframe.html?id=primitives-tabs--keyframe-unmount&viewMode=story');
    const first = page.getByRole('tabpanel', { name: 'Account', includeHidden: true });
    const second = page.getByRole('tabpanel', { name: 'Password', includeHidden: true });
    const firstContent = first.locator('div');
    await expect(firstContent).toBeVisible();
    await expect(second).toHaveCount(0);

    // Pause the actual consumer animation before starting it, then finish it through WAAPI.
    await firstContent.evaluate((element) => {
        element.style.animationPlayState = 'paused';
        element.style.animationDuration = '30s';
    });
    await page.getByRole('tab', { name: 'Password', exact: true }).click();
    await expect(first).toHaveAttribute('data-ending-style', '');
    await expect(first).toHaveAttribute('inert', '');
    await expect(first).not.toHaveAttribute('data-hidden');
    await expect(firstContent).toBeVisible();
    await expect
        .poll(() => firstContent.evaluate((element) => getComputedStyle(element).animationName))
        .toBe('tabs-panel-out');
    await firstContent.evaluate((element) => {
        for (const animation of element.getAnimations()) animation.finish();
    });
    await expect(firstContent).toHaveCount(0);
    await expect(first).toHaveCount(0);
    await expect(second).not.toHaveAttribute('inert');

    await page.getByRole('tab', { name: 'Account', exact: true }).click();
    await expect(firstContent).toBeVisible();
    await expect(first).not.toHaveAttribute('inert');
    await expect(second).toHaveCount(0);
    expect(errors).toEqual([]);
});
