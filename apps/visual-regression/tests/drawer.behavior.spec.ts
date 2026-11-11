import { expect, Page, test } from '@playwright/test';
import { holdExitAnimations } from '../helpers/exit-animations';

declare global {
    interface Window {
        /** Populated by the close-watcher specs' init script. */
        __closeWatchers: EventTarget[];
    }
}

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
        await expect(popup).toHaveCSS('animation-name', 'none');

        const movement = () =>
            popup.evaluate((element) => {
                const transform = getComputedStyle(element).transform;
                return new DOMMatrixReadOnly(transform).m41;
            });
        // Swipe transforms are written in RAF; data-swiping precedes that frame.
        await expect.poll(movement).toBeLessThan(await popup.evaluate((element) => element.offsetWidth));
        const movementAfterShortDrag = await movement();

        await page.mouse.move(box!.x - 180, box!.y + box!.height / 2);

        await expect.poll(movement).toBeLessThan(movementAfterShortDrag);
        const movementAfterLongDrag = await movement();

        expect(movementAfterShortDrag).toBeGreaterThan(0);
        expect(movementAfterLongDrag).toBeLessThan(movementAfterShortDrag);
        expect(movementAfterLongDrag).toBeGreaterThanOrEqual(0);

        await page.mouse.up();

        await expect(popup).not.toHaveAttribute('data-swiping', '');
        // The settling transition can finish before a CI round trip observes its running state.
        // Verify that motion is configured and the drawer actually reaches its open position.
        await expect(popup).toHaveCSS('transition-property', /transform/);
        await expect(popup).not.toHaveCSS('transition-duration', '0s');
        await expect.poll(movement).toBeCloseTo(0, 0);

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

    test('animates closed after an outside click', async ({ page }) => {
        await gotoStory(page, 'primitives-drawer--swipe-to-open');

        const swipeArea = page.locator('[rdxDrawerSwipeArea]');
        const popup = page.locator('[rdxDrawerPopup]');
        const backdrop = page.locator('[rdxDrawerBackdrop]');
        const viewport = page.locator('[rdxDrawerViewport]');
        const box = await swipeArea.boundingBox();

        expect(box).not.toBeNull();

        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.down();
        await page.mouse.move(box!.x - 180, box!.y + box!.height / 2);
        await page.mouse.up();

        await expect(popup).toBeVisible();
        const exit = await holdExitAnimations(page, ['[rdxDrawerPopup]', '[rdxDrawerBackdrop]']);
        await viewport.click({ position: { x: 20, y: 20 } });

        await expect(popup).toHaveAttribute('data-ending-style', '');
        await expect(backdrop).toHaveAttribute('data-closed', '');
        await expect.poll(exit.count).toBeGreaterThan(0);
        await exit.seek(0.5);
        await expect
            .poll(() => popup.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41))
            .toBeGreaterThan(0);
        await expect.poll(exit.count).toBeGreaterThan(0);
        await exit.finish();
        await expect(popup).toBeHidden();
    });
});

test.describe('Drawer mobile navigation', () => {
    test('dismisses against the visible viewport height when the popup is taller than the screen', async ({ page }) => {
        await gotoStory(page, 'primitives-drawer--scrollable');
        await page.getByRole('button', { name: 'Open mobile menu' }).click();

        const popup = page.locator('[rdxDrawerPopup]');
        const viewport = page.locator('[rdxDrawerViewport]');
        const closeButton = page.getByRole('button', { name: 'Close menu' });
        const popupBox = await popup.boundingBox();
        const viewportBox = await viewport.boundingBox();

        expect(popupBox).not.toBeNull();
        expect(viewportBox).not.toBeNull();
        expect(popupBox!.height).toBeGreaterThan(viewportBox!.height);

        const startY = Math.max(popupBox!.y + 24, 24);
        const dragDistance = viewportBox!.height * 0.6;

        await popup.dispatchEvent('pointerdown', {
            button: 0,
            clientX: popupBox!.x + popupBox!.width / 2,
            clientY: startY,
            isPrimary: true,
            pointerId: 1
        });
        await page.evaluate(
            ({ clientX, clientY }) => {
                window.dispatchEvent(
                    new PointerEvent('pointermove', {
                        bubbles: true,
                        button: 0,
                        clientX,
                        clientY,
                        isPrimary: true,
                        pointerId: 1
                    })
                );
            },
            { clientX: popupBox!.x + popupBox!.width / 2, clientY: startY + dragDistance }
        );

        await expect(popup).toHaveAttribute('data-swiping', '');
        await page.waitForTimeout(100);

        await page.evaluate(
            ({ clientX, clientY }) => {
                window.dispatchEvent(
                    new PointerEvent('pointerup', {
                        bubbles: true,
                        button: 0,
                        clientX,
                        clientY,
                        isPrimary: true,
                        pointerId: 1
                    })
                );
            },
            { clientX: popupBox!.x + popupBox!.width / 2, clientY: startY + dragDistance }
        );

        await expect(closeButton).toBeHidden();
    });
});

test.describe('Drawer default', () => {
    test('stretches the anchored-edge bleed while pulling up', async ({ page }) => {
        await gotoStory(page, 'primitives-drawer--default');
        await page.getByRole('button', { name: 'Open drawer' }).click();

        const popup = page.locator('[rdxDrawerPopup]');
        await popup.evaluate((element) =>
            Promise.allSettled(element.getAnimations().map((animation) => animation.finished))
        );
        const box = await popup.boundingBox();

        expect(box).not.toBeNull();

        await popup.dispatchEvent('pointerdown', {
            button: 0,
            clientX: box!.x + box!.width / 2,
            clientY: box!.y + 24,
            isPrimary: true,
            pointerId: 1
        });
        await page.evaluate(
            ({ clientX, clientY }) => {
                window.dispatchEvent(
                    new PointerEvent('pointermove', {
                        bubbles: true,
                        button: 0,
                        clientX,
                        clientY,
                        isPrimary: true,
                        pointerId: 1
                    })
                );
            },
            { clientX: box!.x + box!.width / 2, clientY: box!.y - 176 }
        );

        await expect(popup).toHaveAttribute('data-swiping', '');
        // Swipe writes are coalesced into RAF. Read the related geometry in one browser task
        // after that write, rather than sampling opposite sides of a frame boundary.
        await expect
            .poll(() =>
                popup.evaluate((element) => {
                    const bleedHeight = Number.parseFloat(getComputedStyle(element, '::after').height);
                    const movement = Math.abs(new DOMMatrixReadOnly(getComputedStyle(element).transform).m42);
                    return movement > 48 && bleedHeight >= movement + 47.5;
                })
            )
            .toBe(true);

        await page.evaluate(() => {
            window.dispatchEvent(
                new PointerEvent('pointerup', {
                    bubbles: true,
                    button: 0,
                    clientX: 0,
                    clientY: 0,
                    isPrimary: true,
                    pointerId: 1
                })
            );
        });

        await page.waitForTimeout(75);

        const { settlingBleedHeight, settlingMovement } = await popup.evaluate((element) => ({
            settlingBleedHeight: Number.parseFloat(getComputedStyle(element, '::after').height),
            settlingMovement: Math.abs(new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)
        }));

        expect(settlingBleedHeight).toBeGreaterThanOrEqual(settlingMovement + 47.5);
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

        const popup = page.locator('[rdxDrawerPopup]');
        const dragHeader = popup.locator('[rdxDrawerTitle]').locator('..');
        await page.getByRole('button', { name: 'Open snap drawer' }).click();

        await expect(popup).toBeVisible();
        await popup.evaluate(async (element) => {
            await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
            await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
        });
        const compactBox = await popup.boundingBox();
        expect(compactBox).not.toBeNull();
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
        await popup.evaluate((element) =>
            Promise.allSettled(element.getAnimations().map((animation) => animation.finished))
        );
        const expandedBox = await popup.boundingBox();
        expect(expandedBox!.y).toBeLessThan(compactBox!.y);
    });
});

test.describe('Drawer close watcher', () => {
    // Android delivers its system back gesture as a close request; `CloseWatcher` (Chromium-only) is
    // what surfaces it to the page. The branch is gated on `rdxPlatform.os.android`, so these run in an
    // Android-UA context and intercept the constructor to drive the close event by hand — the real
    // gesture cannot be produced in a desktop browser.
    const ANDROID_UA =
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

    /** Records every `CloseWatcher` the page constructs so the test can fire its close event. */
    const RECORD_WATCHERS = `
        window.__closeWatchers = [];
        const Native = window.CloseWatcher;
        if (Native) {
            window.CloseWatcher = class extends Native {
                constructor(...args) {
                    super(...args);
                    window.__closeWatchers.push(this);
                }
            };
        }
    `;

    async function openDrawer(page: Page): Promise<void> {
        await gotoStory(page, 'primitives-drawer--default');
        await page.getByRole('button', { name: 'Open drawer' }).click();
        await expect(page.locator('[rdxDrawerPopup]')).toBeVisible();
    }

    test('the Android back gesture closes the drawer', async ({ browser }) => {
        const context = await browser.newContext({ userAgent: ANDROID_UA });
        const page = await context.newPage();
        await page.addInitScript(RECORD_WATCHERS);

        await openDrawer(page);
        if (!(await page.evaluate(() => typeof Reflect.get(window, 'CloseWatcher') === 'function'))) {
            await context.close();
            test.skip(true, 'This engine has no native CloseWatcher');
        }
        expect(await page.evaluate(() => window.__closeWatchers.length), 'a watcher is registered').toBeGreaterThan(0);

        await page.evaluate(() => window.__closeWatchers.at(-1).dispatchEvent(new Event('close')));
        await expect(page.locator('[rdxDrawerPopup]')).toHaveCount(0);

        await context.close();
    });

    test('no watcher is registered off Android', async ({ page }) => {
        // Elsewhere Escape and nesting are owned by the dismissal layer; a second close path would
        // fight it, so the drawer must not register a watcher at all.
        await page.addInitScript(RECORD_WATCHERS);
        await openDrawer(page);

        expect(await page.evaluate(() => window.__closeWatchers.length)).toBe(0);
    });
});
