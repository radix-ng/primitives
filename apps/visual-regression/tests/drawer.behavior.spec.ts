import { expect, Page, test } from '@playwright/test';

async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test.describe('Drawer swipe area', () => {
    test('opens from the right edge and portals into the local container', async ({ page }) => {
        await gotoStory(page, 'primitives-drawer--swipe-to-open');

        const container = page.locator('[rdxDrawerRoot]').locator('..');
        const swipeArea = page.locator('[rdxDrawerSwipeArea]');
        const box = await swipeArea.boundingBox();

        expect(box).not.toBeNull();

        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.down();
        await page.mouse.move(box!.x - 50, box!.y + box!.height / 2);

        const popup = container.locator('[rdxDrawerPopup]');
        const viewport = container.locator('[rdxDrawerViewport]');

        await expect(popup).toBeVisible();
        await expect(viewport).toBeVisible();
        await expect(popup).toHaveAttribute('data-swiping', '');

        const movementAfterShortDrag = await popup.evaluate((element) => {
            const transform = getComputedStyle(element).transform;
            return new DOMMatrixReadOnly(transform).m41;
        });

        await page.mouse.move(box!.x - 180, box!.y + box!.height / 2);

        const movementAfterLongDrag = await popup.evaluate((element) => {
            const transform = getComputedStyle(element).transform;
            return new DOMMatrixReadOnly(transform).m41;
        });

        expect(movementAfterShortDrag).toBeGreaterThan(0);
        expect(movementAfterLongDrag).toBeLessThan(movementAfterShortDrag);
        expect(movementAfterLongDrag).toBeGreaterThanOrEqual(0);

        await page.mouse.up();

        await expect(popup).not.toHaveAttribute('data-swiping', '');
        await expect
            .poll(() =>
                popup.evaluate((element) =>
                    element
                        .getAnimations()
                        .some(
                            (animation) =>
                                animation.playState === 'running' &&
                                (animation.effect as KeyframeEffect | null)
                                    ?.getKeyframes()
                                    .some((frame) => frame['transform'] !== undefined)
                        )
                )
            )
            .toBe(true);

        await expect(swipeArea).toHaveAttribute('data-swipe-direction', 'left');
        await expect(swipeArea).toHaveCSS('pointer-events', 'none');
    });

    test('settles closed when the opening swipe is released too early', async ({ page }) => {
        await gotoStory(page, 'primitives-drawer--swipe-to-open');

        const swipeArea = page.locator('[rdxDrawerSwipeArea]');
        const popup = page.locator('[rdxDrawerPopup]');
        const box = await swipeArea.boundingBox();

        expect(box).not.toBeNull();

        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.down();
        await page.mouse.move(box!.x + box!.width / 2 - 20, box!.y + box!.height / 2);

        await expect(popup).toBeVisible();
        await expect(popup).toHaveAttribute('data-swiping', '');

        await page.mouse.up();

        await expect(popup).toBeHidden();
    });
});

test.describe('Drawer indent effect', () => {
    test('scales the page and follows the closing swipe progress', async ({ page }) => {
        await gotoStory(page, 'primitives-drawer--page-scale');

        const indent = page.locator('[rdxDrawerIndent]');
        const trigger = page.getByRole('button', { name: 'Open drawer' });
        const canvas = page.locator('[data-demo="tailwind"]');

        const indentBox = await indent.boundingBox();
        const canvasBox = await canvas.boundingBox();

        expect(indentBox).not.toBeNull();
        expect(canvasBox).not.toBeNull();
        expect(indentBox!.width).toBeGreaterThan(canvasBox!.width * 0.9);

        await trigger.click();
        await expect(indent).toHaveAttribute('data-active', '');
        await expect(page.locator('[rdxDrawerPopup]')).not.toHaveAttribute('data-starting-style', '');
        await expect
            .poll(() => indent.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a))
            .toBeCloseTo(0.98, 2);

        const activeScale = await indent.evaluate(
            (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a
        );
        expect(activeScale).toBeLessThan(1);

        const popup = page.locator('[rdxDrawerPopup]');
        await popup.dispatchEvent('pointerdown', {
            button: 0,
            clientX: 100,
            clientY: 10,
            isPrimary: true,
            pointerId: 1
        });
        await page.evaluate(() => {
            window.dispatchEvent(
                new PointerEvent('pointermove', {
                    bubbles: true,
                    button: 0,
                    clientX: 100,
                    clientY: 60,
                    isPrimary: true,
                    pointerId: 1
                })
            );
        });

        await expect(popup).toHaveAttribute('data-swiping', '');
        await expect
            .poll(() => indent.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a))
            .toBeGreaterThan(activeScale);

        await page.evaluate(() => {
            window.dispatchEvent(
                new PointerEvent('pointercancel', {
                    bubbles: true,
                    button: 0,
                    clientX: 100,
                    clientY: 60,
                    isPrimary: true,
                    pointerId: 1
                })
            );
        });
    });
});

test.describe('Drawer snap points', () => {
    test('opens at the compact point and expands from the drag header', async ({ page }) => {
        await gotoStory(page, 'primitives-drawer--snap-points');

        await page.getByRole('button', { name: 'Open snap drawer' }).click();

        const popup = page.locator('[rdxDrawerPopup]');
        const dragHeader = popup.locator('[rdxDrawerTitle]').locator('..');

        await expect(popup).toBeVisible();
        await expect(popup).not.toHaveAttribute('data-expanded', '');
        await expect
            .poll(() =>
                popup.evaluate((element) =>
                    Number.parseFloat(element.style.getPropertyValue('--drawer-snap-point-offset'))
                )
            )
            .toBeGreaterThan(0);

        await dragHeader.dispatchEvent('pointerdown', {
            button: 0,
            clientX: 100,
            clientY: 300,
            isPrimary: true,
            pointerId: 1
        });
        await page.evaluate(() => {
            window.dispatchEvent(
                new PointerEvent('pointermove', {
                    bubbles: true,
                    button: 0,
                    clientX: 100,
                    clientY: 80,
                    isPrimary: true,
                    pointerId: 1
                })
            );
        });

        await expect(popup).toHaveAttribute('data-swiping', '');

        await page.evaluate(() => {
            window.dispatchEvent(
                new PointerEvent('pointerup', {
                    bubbles: true,
                    button: 0,
                    clientX: 100,
                    clientY: 80,
                    isPrimary: true,
                    pointerId: 1
                })
            );
        });

        await expect(popup).toHaveAttribute('data-expanded', '');
        await expect
            .poll(() =>
                popup.evaluate((element) =>
                    Number.parseFloat(element.style.getPropertyValue('--drawer-snap-point-offset'))
                )
            )
            .toBe(0);
    });
});
