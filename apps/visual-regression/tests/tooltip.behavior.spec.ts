import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral check for the structural `*rdxTooltipPortal` (ADR 0010). Tooltip's old anatomy parked an
 * empty portal wrapper `<div>` in `<body>` (the portal sat outside the presence template); the
 * structural form relocates the positioner itself with no wrapper. Drives the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('tooltip teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-tooltip--default');

    await page.locator('[rdxTooltipTrigger]').first().hover();
    await expect(page.locator('[rdxTooltipPopup]')).toBeVisible();

    const parentTag = await page.locator('[rdxTooltipPositioner]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
});

test('the default arrow is visible and points at the trigger', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await gotoStory(page, 'primitives-tooltip--default');

    const trigger = page.locator('[rdxTooltipTrigger]').first();
    const arrow = page.locator('[rdxTooltipArrow]');
    const popup = page.locator('[rdxTooltipPopup]');
    await trigger.hover();
    await expect(popup).toBeVisible();
    await expect(arrow).toBeVisible();
    await expect(arrow).not.toHaveAttribute('hidden');
    await expect(arrow).toHaveAttribute('data-side', 'top');

    await expect
        .poll(async () => {
            const anchorBounds = (await trigger.boundingBox())!;
            const arrowBounds = (await arrow.boundingBox())!;
            return Math.abs(arrowBounds.x + arrowBounds.width / 2 - anchorBounds.x - anchorBounds.width / 2);
        })
        .toBeLessThan(2);
    const arrowBounds = (await arrow.boundingBox())!;
    const popupBounds = (await popup.boundingBox())!;
    expect(arrowBounds.y).toBeGreaterThan(popupBounds.y + popupBounds.height / 2);
    expect(errors).toEqual([]);
});

test('a controlled tooltip follows the slider thumb while dragging', async ({ page }) => {
    await gotoStory(page, 'primitives-tooltip--slider');

    const thumb = page.locator('[rdxSliderThumb]');
    const popup = page.getByRole('tooltip');
    const slider = page.getByRole('slider', { name: 'Volume' });
    const bounds = (await thumb.boundingBox())!;
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;

    await expect(slider).toHaveValue('45');
    await page.mouse.move(x, y);
    await page.mouse.down();
    await expect(popup).toBeVisible();
    const initialPopupX = (await popup.boundingBox())!.x;
    await page.mouse.move(x + 40, y, { steps: 4 });
    await expect(slider).not.toHaveValue('45');
    await expect.poll(async () => (await popup.boundingBox())?.x ?? initialPopupX).toBeGreaterThan(initialPopupX + 20);
    await page.mouse.up();
    await expect(popup).toHaveCount(0);
});

test('the viewport animates the popup size as hover moves to a new trigger', async ({ page }) => {
    await gotoStory(page, 'primitives-tooltip--viewport');
    const popup = page.getByRole('tooltip');
    const viewport = page.locator('[rdxTooltipViewport]');
    const previous = viewport.locator(':scope > [data-previous]');
    await page.getByRole('button', { name: 'Set a timer' }).hover();
    await expect(popup).toBeVisible();
    const initialWidth = (await popup.boundingBox())!.width;
    await page.getByRole('button', { name: 'Delete' }).hover();
    await expect(previous).toHaveText('Set a timer');
    await expect(viewport).toHaveAttribute('data-activation-direction', 'right');
    await expect
        .poll(() =>
            popup.evaluate((element) =>
                element
                    .getAnimations()
                    .some((animation) => 'transitionProperty' in animation && animation.transitionProperty === 'width')
            )
        )
        .toBe(true);
    await expect(previous).toHaveCount(0);
    await expect(popup).toHaveText('Delete: This action cannot be undone');
    await expect.poll(async () => (await popup.boundingBox())?.width ?? 0).toBeGreaterThan(initialWidth);
});

test('the viewport settles on the new content with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoStory(page, 'primitives-tooltip--viewport');
    const viewport = page.locator('[rdxTooltipViewport]');
    await page.getByRole('button', { name: 'Preview audio' }).hover();
    await expect(viewport).toHaveText('Listen to audio preview');
    await page.getByRole('button', { name: 'Set a timer' }).hover();
    await expect(viewport).toHaveText('Set a timer');
    await expect(viewport.locator('[data-previous]')).toHaveCount(0);
    await expect(viewport).not.toHaveAttribute('data-transitioning');
});

test('reopening during tooltip exit reuses the popup and replaces its content', async ({ page }) => {
    await gotoStory(page, 'primitives-tooltip--viewport');
    await page.addStyleTag({
        content: `
            @keyframes hold-tooltip-exit { from { opacity: 1; } to { opacity: 0; } }
            [rdxTooltipPopup][data-ending-style] { animation: hold-tooltip-exit 10s linear paused !important; }
        `
    });
    const popup = page.locator('[rdxTooltipPopup]');
    const preview = page.getByRole('button', { name: 'Preview audio' });
    const timer = page.getByRole('button', { name: 'Set a timer' });
    await preview.hover();
    await expect(popup).toBeVisible();
    await popup.evaluate((element) => element.setAttribute('data-test-original-popup', ''));
    await page.keyboard.press('Escape');
    await expect(popup).toHaveAttribute('data-ending-style', '');
    await expect(popup).toHaveAttribute('data-instant', 'dismiss');

    await timer.focus();
    await expect(popup).toHaveAttribute('data-open', '');
    await expect(popup).toHaveAttribute('data-test-original-popup', '');
    await expect(popup).toHaveText('Set a timer');
    await expect(popup.locator('[data-previous]')).toHaveCount(0);
    await expect(timer).toHaveAttribute('aria-describedby', (await popup.getAttribute('id'))!);
});

/**
 * ADR 0015 migration of Tooltip onto the new floating dismissal engine (dismissal-only — no focus
 * manager). Browser-only: real keyboard / pointer dismissal needs a real browser.
 */
test.describe('Tooltip — new floating engine migration', () => {
    const trigger = '[rdxTooltipTrigger]';
    const popup = '[rdxTooltipPopup]';

    test('Escape closes the tooltip', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        await gotoStory(page, 'primitives-tooltip--default');

        await page.locator(trigger).first().hover();
        await expect(page.locator(popup)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);
        expect(errors).toEqual([]);
    });

    test('an outside press closes the tooltip', async ({ page }) => {
        await gotoStory(page, 'primitives-tooltip--default');

        await page.locator(trigger).first().hover();
        await expect(page.locator(popup)).toBeVisible();

        // Far top-left corner — outside the trigger and the popup.
        await page.mouse.click(5, 5);
        await expect(page.locator(popup)).toHaveCount(0);
    });
});
