import { expect, test } from '@playwright/test';
import { holdExitAnimations } from '../helpers/exit-animations';

test('Toast holds the closed item through its transition and removes it afterwards', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-toast--default&viewMode=story');
    await page.getByRole('button', { name: 'Show toast' }).click();

    const selector = '[rdxToastRoot]';
    const root = page.locator(selector);
    await expect(root).toBeVisible();
    const exit = await holdExitAnimations(page, [selector], 'data-state');
    await root.getByRole('button', { name: 'Dismiss' }).focus();
    await root.getByRole('button', { name: 'Dismiss' }).press('Enter');

    await expect(root).toHaveAttribute('data-state', 'closed');
    await expect.poll(exit.count).toBeGreaterThan(0);
    // Descendant animations bubble, but only the Root owns the exit.
    await root.locator('[rdxToastContent]').dispatchEvent('animationend');
    await expect(root).toBeAttached();
    await exit.finish();
    await expect(root).toHaveCount(0);
});

test('Toast removes dismissed items with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/iframe.html?id=primitives-toast--default&viewMode=story');
    await page.getByRole('button', { name: 'Show toast' }).click();
    const root = page.locator('[rdxToastRoot]');
    await expect(root).toBeVisible();
    await expect(root).toHaveCSS('transition-duration', '0s');

    await root.getByRole('button', { name: 'Dismiss' }).click();
    await expect(root).toHaveCount(0);
    await page.getByRole('button', { name: 'Show toast' }).click();
    await expect(root).toContainText('Notification 2');
    await expect(root).toHaveCSS('--toast-index', '0');
});

test('Toast still waits for exit keyframes on the Root', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-toast--stacking&viewMode=story');
    await page.getByRole('button', { name: 'Add toast' }).click();

    const selector = '[rdxToastRoot]';
    const root = page.locator(selector);
    await expect(root).toBeVisible();
    const exit = await holdExitAnimations(page, [selector], 'data-state');
    await page.getByRole('button', { name: 'Clear all' }).click();

    await expect(root).toHaveAttribute('data-state', 'closed');
    await expect(root).toHaveCSS('animation-name', 'toast-out');
    await expect.poll(exit.count).toBeGreaterThan(0);
    await exit.finish();
    await expect(root).toHaveCount(0);
});
