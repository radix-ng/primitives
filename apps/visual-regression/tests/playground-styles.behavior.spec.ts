import { expect, test } from '@playwright/test';
import { expectDemoSurface } from '../helpers/demo-surface';

for (const theme of ['light', 'dark']) {
    test(`Playground retains the shared surface and utility overrides in the ${theme} theme`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto('/playground/popover');
        if (theme === 'light') await page.getByRole('button', { name: 'Switch to light theme' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await page.getByRole('button', { name: 'Add details', exact: true }).click();
        const popup = page.locator('[rdxPopoverPopup]');
        await expect(popup).toBeVisible();
        await expect(popup).toHaveClass(/\bdemo-surface\b/);
        // Use a border utility present in the app's templates: Tailwind does not scan test files.
        await expectDemoSurface(popup, 'shadow-lg', 'border-primary/30');
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        await expect(popup).toHaveCount(0);
        expect(errors).toEqual([]);
    });
}
