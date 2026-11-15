import { expect, test } from '@playwright/test';

test('Tabs keyframe contents finish their exit before removal and the empty host becomes hidden', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto('/iframe.html?id=primitives-tabs--keyframe-unmount&viewMode=story');
    const panels = page.locator('[rdxTabsPanel]');
    const first = panels.nth(0);
    const second = panels.nth(1);
    const firstContent = first.locator('div');
    await expect(firstContent).toBeVisible();
    await expect(second).toBeHidden();

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
    await expect(first).toBeHidden();
    await expect(first).toHaveAttribute('data-hidden', '');
    await expect(first).not.toHaveAttribute('data-ending-style');
    await expect(second).not.toHaveAttribute('inert');

    await page.getByRole('tab', { name: 'Account', exact: true }).click();
    await expect(firstContent).toBeVisible();
    await expect(first).not.toHaveAttribute('inert');
    await expect(second).toBeHidden();
    expect(errors).toEqual([]);
});
