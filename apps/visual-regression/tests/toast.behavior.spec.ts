import { expect, test } from '@playwright/test';
import { holdExitAnimations } from '../helpers/exit-animations';

test('Toast holds the closed item through its transition and removes it afterwards', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-toast--default&viewMode=story');
    await page.getByRole('button', { name: 'Show toast' }).click();

    const selector = '[rdxToastRoot]';
    const root = page.locator(selector);
    await expect(root).toBeVisible();
    const exit = await holdExitAnimations(page, [selector], 'data-ending-style');
    await root.getByRole('button', { name: 'Dismiss' }).focus();
    await root.getByRole('button', { name: 'Dismiss' }).press('Enter');

    await expect(root).toHaveAttribute('data-ending-style', '');
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
    const exit = await holdExitAnimations(page, [selector], 'data-ending-style');
    await page.getByRole('button', { name: 'Clear all' }).click();

    await expect(root).toHaveAttribute('data-ending-style', '');
    await expect(root).toHaveCSS('animation-name', 'toast-out');
    await expect.poll(exit.count).toBeGreaterThan(0);
    await exit.finish();
    await expect(root).toHaveCount(0);
});

test('Toast moves keyboard focus through the viewport and restores it on dismissal', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-toast--stacking&viewMode=story');
    const origin = page.getByRole('button', { name: 'Add toast' });
    const viewport = page.getByRole('region', { name: 'Notifications' });
    await origin.click();
    await origin.focus();

    await page.keyboard.press('F6');
    await expect(viewport).toBeFocused();
    await expect(viewport).toHaveAttribute('aria-live', 'polite');
    await expect(viewport).toHaveAttribute('data-expanded', '');
    await page.keyboard.press('Shift+Tab');
    await expect(origin).toBeFocused();

    await page.keyboard.press('F6');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('dialog', { name: 'Message 1' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(origin).toBeFocused();
    await expect(page.locator('[rdxToastRoot]')).toHaveCount(0);
});

test('Toast promotes the limited item when a place in the stack opens', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-toast--stacking&viewMode=story');
    const add = page.getByRole('button', { name: 'Add toast' });
    for (let index = 0; index < 4; index++) await add.click();

    const roots = page.locator('[rdxToastRoot]');
    const oldest = roots.filter({ hasText: 'Message 1' });
    await expect(roots).toHaveCount(4);
    await expect(oldest).toHaveAttribute('data-limited', '');
    await expect(oldest).toHaveAttribute('inert', '');
    await expect(oldest).toBeHidden();

    await roots.filter({ hasText: 'Message 4' }).getByRole('button', { name: 'Dismiss' }).click();
    await expect(roots).toHaveCount(3);
    await expect(oldest).toBeVisible();
    await expect(oldest).not.toHaveAttribute('inert');
    await expect(oldest.locator('[rdxToastContent]')).toHaveAttribute('data-behind', '');
    await expect(page.locator('[rdxToastViewport]')).toHaveCSS('--toast-frontmost-height', /[1-9]\d*px/);
});

test('Anchored Toast positions a decorative arrow and ignores swipe', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/iframe.html?id=primitives-toast--anchored&viewMode=story');
    await page.getByRole('button', { name: 'Anchored toast' }).click();

    const root = page.locator('[rdxToastRoot]');
    const arrow = root.locator('[rdxToastArrow]');
    await expect(arrow.locator('svg')).toBeVisible();
    await expect(arrow).toHaveAttribute('aria-hidden', 'true');
    await expect(arrow).toHaveAttribute('data-side', /top|bottom/);
    await expect(root).toHaveCSS('touch-action', 'auto');

    const bounds = await root.boundingBox();
    if (!bounds) throw new Error('Toast must have a rendered box');
    const x = bounds.x + bounds.width / 3;
    const y = bounds.y + bounds.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 115, y, { steps: 8 });
    await expect(root).not.toHaveAttribute('data-swiping');
    await page.mouse.up();
    await expect(root).toBeVisible();
    await expect(root).not.toHaveAttribute('data-ending-style');
});

test('Toast announces high-priority copy assertively and exposes its dialog on keyboard focus', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-toast--types&viewMode=story');
    const trigger = page.getByRole('button', { name: 'Error', exact: true });
    await trigger.click();
    const alert = page.locator('.rdx-live-announcer');
    await expect(alert).toHaveAttribute('aria-live', 'assertive');
    await expect(alert).toContainText('Something went wrong');

    await trigger.focus();
    await page.keyboard.press('F6');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('alertdialog', { name: 'Something went wrong' })).toBeFocused();
});

test('Toast can replace the same ID while its prior exit is running', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-toast--deduplicated&viewMode=story');
    const copy = page.getByRole('button', { name: 'Copy link' });
    await copy.click();
    const selector = '[rdxToastRoot]';
    const root = page.locator(selector);
    const exit = await holdExitAnimations(page, [selector], 'data-ending-style');
    await root.getByRole('button', { name: 'Dismiss' }).click();
    await expect.poll(exit.count).toBeGreaterThan(0);

    await copy.click();
    await expect(root).not.toHaveAttribute('data-ending-style');
    await exit.finish();
    await expect(root).toHaveCount(1);
    await expect(root).toContainText('Copied 2 times.');
});
