import { expect, test } from '@playwright/test';

const storyUrl = '/iframe.html?id=primitives-radio-group--default&viewMode=story';

test('Radio Default animates the dot and retains it until its exit completes', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(storyUrl);
    const group = page.getByRole('radiogroup', { name: 'View density' });
    const first = group.getByRole('radio', { name: 'Default', exact: true });
    const second = group.getByRole('radio', { name: 'Comfortable', exact: true });
    const dot = first.locator('[rdxRadioIndicator]');
    await expect(dot).toHaveCount(0);
    await first.evaluate((node) => {
        node.addEventListener('transitionrun', (event) => {
            if ((event as TransitionEvent).propertyName === 'opacity') node.setAttribute('data-dot-entered', '');
        });
    });
    await first.click();
    await expect(dot).toBeVisible();
    await expect(first).toHaveAttribute('data-dot-entered', '');
    await expect(dot).toHaveCSS('opacity', '1');
    await dot.evaluate((node) => {
        node.style.transitionDuration = '10s';
        node.setAttribute('data-original', '');
    });
    await second.click();
    await expect(dot).toHaveAttribute('data-ending-style', '');
    await expect.poll(() => dot.evaluate((node) => node.getAnimations().length)).toBeGreaterThan(0);

    await first.click();
    await expect(dot).toHaveAttribute('data-original', '');
    await expect(dot).not.toHaveAttribute('data-ending-style');
    await second.click();
    await expect(dot).toHaveAttribute('data-ending-style', '');
    await dot.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
    await expect(dot).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('Radio Default removes its dot on deselection with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(storyUrl);
    const first = page.getByRole('radio', { name: 'Default', exact: true });
    const second = page.getByRole('radio', { name: 'Comfortable', exact: true });
    await first.click();
    const dot = first.locator('[rdxRadioIndicator]');
    await expect(dot).toBeVisible();
    await expect(dot).toHaveCSS('transition-duration', '0s');
    await second.click();
    await expect(dot).toHaveCount(0);
});
