import { expect, Page, test } from '@playwright/test';

async function openStory(page: Page, story = 'arrow', args = ''): Promise<string[]> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    await page.goto(`/iframe.html?id=primitives-select--${story}&viewMode=story&args=${args}`);
    await expect(page.locator('[rdxSelectTrigger]')).toBeVisible();
    return errors;
}

test('arrow uses shared geometry and SVG dimensions, then cleans up on close and reopen', async ({ page }) => {
    const errors = await openStory(page);
    const trigger = page.getByRole('combobox');
    await trigger.click();
    const arrow = page.locator('[rdxSelectArrow]');
    await expect(arrow).toBeVisible();
    await expect(arrow).toHaveAttribute('aria-hidden', 'true');
    await expect(arrow).toHaveAttribute('data-open', '');
    await expect(arrow).toHaveAttribute('data-side', 'bottom');
    await expect(arrow).toHaveAttribute('data-align', 'center');
    await expect(arrow.locator('svg')).toHaveCSS('width', '12px');
    await expect(arrow.locator('svg')).toHaveCSS('height', '6px');
    await expect
        .poll(() =>
            arrow.evaluate((element) => {
                const arrow = element.getBoundingClientRect();
                const trigger = document.querySelector('[rdxSelectTrigger]')!.getBoundingClientRect();
                return Math.abs(arrow.x + arrow.width / 2 - trigger.x - trigger.width / 2);
            })
        )
        .toBeLessThan(1);
    await page.keyboard.press('Escape');
    await expect(arrow).toHaveCount(0);
    await trigger.click();
    await expect(arrow).toBeVisible();
    await expect(arrow.locator('svg')).toHaveCount(1);
    expect(errors).toEqual([]);
});

for (const [dir, physicalSide] of [
    ['ltr', 'right'],
    ['rtl', 'left']
]) {
    test(`arrow resolves logical sides in ${dir}`, async ({ page }) => {
        const errors = await openStory(page, 'arrow', `side:inline-end;dir:${dir}`);
        await page.getByRole('combobox').click();
        const arrow = page.locator('[rdxSelectArrow]');
        await expect(arrow).toBeVisible();
        await expect(arrow).toHaveAttribute('data-side', 'inline-end');
        await expect
            .poll(() =>
                page.locator('[rdxSelectPopup]').evaluate((element, side) => {
                    const popup = element.getBoundingClientRect();
                    const trigger = document.querySelector('[rdxSelectTrigger]')!.getBoundingClientRect();
                    return side === 'left' ? popup.right < trigger.left : popup.left > trigger.right;
                }, physicalSide)
            )
            .toBe(true);
        expect(errors).toEqual([]);
    });
}

test('arrow follows a collision flip and stays visible when uncentered', async ({ page }) => {
    const errors = await openStory(page, 'arrow', 'alignOffset:280');
    await page.getByRole('combobox').click();
    const arrow = page.locator('[rdxSelectArrow]');
    await expect(arrow).toHaveAttribute('data-uncentered', '');
    await expect(arrow).toBeVisible();
    await page.keyboard.press('Escape');

    await page.setViewportSize({ width: 500, height: 450 });
    await page.goto('/iframe.html?id=primitives-select--arrow&viewMode=story');
    await page.getByRole('combobox').evaluate((element: HTMLElement) => {
        element.style.transform = 'translateY(160px)';
    });
    await page.getByRole('combobox').click();
    await expect(arrow).toHaveAttribute('data-side', 'top');
    await expect(arrow).toBeVisible();
    expect(errors).toEqual([]);
});

test('item alignment hides the arrow; a touch fallback restores and positions it', async ({ page }) => {
    const errors = await openStory(page, 'aligned-position');
    const trigger = page.getByRole('combobox');
    await trigger.click();
    const arrow = page.locator('[rdxSelectArrow]');
    await expect(arrow).toBeHidden();
    await expect(arrow).toHaveAttribute('data-side', 'none');
    await expect(arrow.locator('svg')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(arrow).toHaveCount(0);

    await trigger.dispatchEvent('pointerdown', { pointerType: 'touch', pointerId: 1, button: 0 });
    await trigger.dispatchEvent('pointerup', { pointerType: 'touch', pointerId: 1, button: 0 });
    await expect(arrow).toBeVisible();
    await expect(arrow).toHaveAttribute('data-side', 'bottom');
    await expect(arrow).toHaveAttribute('data-align', 'start');
    await expect
        .poll(() =>
            arrow.evaluate((element) => {
                const arrow = element.getBoundingClientRect();
                const trigger = document.querySelector('[rdxSelectTrigger]')!.getBoundingClientRect();
                return Math.abs(arrow.x + arrow.width / 2 - trigger.x - trigger.width / 2);
            })
        )
        .toBeLessThan(1);
    await arrow.locator('svg').evaluate((element: SVGElement) => {
        element.style.width = '24px';
        element.style.height = '12px';
    });
    await expect
        .poll(() =>
            arrow.evaluate((element) => {
                const rect = element.getBoundingClientRect();
                const trigger = document.querySelector('[rdxSelectTrigger]')!.getBoundingClientRect();
                return Math.abs(rect.x + rect.width / 2 - trigger.x - trigger.width / 2);
            })
        )
        .toBeLessThan(1);
    await page.keyboard.press('Escape');
    await expect(arrow).toHaveCount(0);
    await trigger.click();
    await expect(arrow).toBeHidden();
    expect(errors).toEqual([]);
});

test('an item-aligned arrow stays hidden and exposes closed state throughout exit', async ({ page }) => {
    const errors = await openStory(page, 'aligned-position');
    await page.addStyleTag({
        content: `
        @keyframes select-arrow-exit { from { opacity: 1; } to { opacity: 0; } }
        [rdxSelectPopup][data-closed] { animation: select-arrow-exit 10s linear; }
    `
    });
    await page.getByRole('combobox').click();
    const arrow = page.locator('[rdxSelectArrow]');
    await expect(arrow).toHaveAttribute('data-open', '');
    await page.keyboard.press('Escape');
    await expect(arrow).toHaveAttribute('data-closed', '');
    await expect(arrow).not.toHaveAttribute('data-open');
    await expect(arrow).toBeHidden();
    await expect(arrow.locator('svg')).toHaveCount(0);
    await page
        .locator('[rdxSelectPopup]')
        .evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
    await expect(arrow).toHaveCount(0);
    expect(errors).toEqual([]);
});
