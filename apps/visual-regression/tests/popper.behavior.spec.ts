import { expect, test } from '@playwright/test';

test('updates the transform origin when the arrow renders and its border box resizes', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/iframe.html?id=primitives-popover--default&viewMode=story');
    await page.locator('[rdxPopoverTrigger]').click();

    const arrow = page.locator('[rdxPopoverArrow]');
    await expect(arrow).toBeVisible();
    await expect(page.locator('[rdxPopoverPositioner]')).toHaveAttribute('data-side', 'bottom');

    async function expectMeasuredOrigin() {
        await expect
            .poll(() =>
                arrow.evaluate((element: HTMLElement) => {
                    const positioner = element.closest('[rdxPopoverPositioner]');
                    if (!positioner) throw new Error('Missing Popover positioner');

                    const [x, y] = getComputedStyle(positioner)
                        .getPropertyValue('--radix-popper-transform-origin')
                        .trim()
                        .split(/\s+/)
                        .map(parseFloat);

                    return {
                        x: x - (parseFloat(element.style.left) + element.offsetWidth / 2),
                        y: y + element.offsetHeight
                    };
                })
            )
            .toEqual({ x: 0, y: 0 });
    }

    await expectMeasuredOrigin();

    await arrow.locator('svg').evaluate((element: SVGElement) => {
        element.style.width = '24px';
        element.style.height = '12px';
    });
    await expect.poll(() => arrow.evaluate((element: HTMLElement) => element.offsetHeight)).toBe(12);
    await expectMeasuredOrigin();

    await arrow.evaluate((element: HTMLElement) => {
        element.style.border = '2px solid transparent';
    });
    await expect.poll(() => arrow.evaluate((element: HTMLElement) => element.offsetHeight)).toBe(16);
    await expectMeasuredOrigin();

    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxPopoverPopup]')).toHaveCount(0);
    expect(errors).toEqual([]);
});
