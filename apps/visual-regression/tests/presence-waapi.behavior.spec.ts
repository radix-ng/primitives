import { expect, Locator, Page, test } from '@playwright/test';

/**
 * Signal-owned render lifetimes need browser coverage: jsdom cannot discover CSS transitions or
 * keyframes. Explicit descendants, finite timing and replacement animations are covered here. Each
 * fixture lives in `Utilities/Presence` (tagged `!visual`) and is driven through the built Storybook.
 *
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

const mountButton = (page: Page): Locator => page.getByRole('button');

test.describe('Presence render lifetime', () => {
    test('the public default example animates entry and exit with Tailwind', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--default');
        // Extend real CSS timing so discovery is independent of test-machine scheduling.
        await page.addStyleTag({ content: '.presence-box { transition-duration: 2s; }' });
        const box = page.locator('.presence-box');
        await mountButton(page).click();
        await expect(box).toBeAttached();
        await expect.poll(() => box.evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);
        await box.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
        await mountButton(page).click();
        await expect(box).toHaveAttribute('data-state', 'closed');
        await expect.poll(() => box.evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);
        await box.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
        await expect(box).toHaveCount(0);
    });

    test('transition-only exit keeps the content mounted until the transition finishes', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-transition-exit');

        const box = page.locator('.waapi-box');
        await mountButton(page).click();
        await expect(box).toBeVisible();

        // Close: the only exit styling is a CSS transition (no @keyframes anywhere).
        await mountButton(page).click();

        // Mid-exit: still in the DOM with the closed state applied (would be gone instantly on main).
        await expect(box).toHaveAttribute('data-state', 'closed');
        await expect(box).toBeAttached();

        // Once the transition ends, the machine unmounts it.
        await expect(box).toHaveCount(0);
    });

    test('an explicitly registered descendant keyframe retains the view', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-subtree-keyframe-exit');

        const root = page.locator('.waapi-root');
        await mountButton(page).click();
        await expect(root).toBeVisible();

        await mountButton(page).click();

        // Only the child carries an animation; rdxPresenceTarget registers it with the lifetime.
        await expect(root).toHaveAttribute('data-state', 'closed');
        await expect(root).toBeAttached();

        await expect(root).toHaveCount(0);
    });

    test('an explicitly registered infinite animation never delays unmount', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-infinite-spinner-no-delay');

        const root = page.locator('.waapi-root');
        await mountButton(page).click();
        await expect(root).toBeVisible();

        // The spinner inside has been running since mount; closing has no exit animation of its own.
        await mountButton(page).click();

        // Infinite animations are excluded by timing, independently of their start time.
        await expect(root).toHaveCount(0, { timeout: 1000 });
    });

    test('re-opening during a transition exit keeps the view (version guard, no teardown)', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-transition-exit');

        const box = page.locator('.waapi-box');
        await mountButton(page).click();
        await expect(box).toBeVisible();
        const original = await box.elementHandle();

        // Start the exit transition, then immediately re-open before it finishes.
        await mountButton(page).click();
        await expect(box).toHaveAttribute('data-state', 'closed');
        await mountButton(page).click();

        // The re-open bumps the exit version, so the in-flight transition's resolution is ignored and
        // the same element stays mounted and open — no flicker/unmount.
        await expect(box).toHaveAttribute('data-state', 'open');
        await expect(box).toBeAttached();
        expect(await box.evaluate((element, previous) => element === previous, original)).toBe(true);

        // Give the stale transition time to (wrongly) resolve; it must not tear the view down.
        await page.waitForTimeout(400);
        await expect(box).toHaveCount(1);
        await expect(box).toHaveAttribute('data-state', 'open');
    });

    test('a canceled transition waits for its paused replacement', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-transition-exit');
        await mountButton(page).click();
        const box = page.locator('.waapi-box');
        await expect(box).toBeVisible();
        await mountButton(page).click();
        await expect(box).toHaveAttribute('data-state', 'closed');
        await box.evaluate(async (element) => {
            const previous = element.getAnimations();
            const replacement = element.animate([{ opacity: 0.7 }, { opacity: 0 }], { duration: 2000 });
            replacement.pause();
            previous.forEach((animation) => animation.cancel());
            await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        });
        await expect(box).toBeAttached();
        await box.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
        await expect(box).toHaveCount(0);
    });

    test('finite WAAPI timing includes iterations and playback rate', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-transition-exit');
        await mountButton(page).click();
        const box = page.locator('.waapi-box');
        await expect(box).toBeVisible();
        await box.evaluate((element) => {
            element.style.transition = 'none';
            const animation = element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, iterations: 4 });
            animation.playbackRate = 0.5;
        });
        await mountButton(page).click();
        await expect(box).toHaveAttribute('data-state', 'closed');
        const retained = await box.evaluate(async (element) => {
            await new Promise((resolve) => setTimeout(resolve, 250));
            return element.isConnected;
        });
        expect(retained).toBe(true);
        await box.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
        await expect(box).toHaveCount(0);
    });

    test('pausing discovered motion keeps the view beyond its original safety timer', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-transition-exit');
        await mountButton(page).click();
        const box = page.locator('.waapi-box');
        await expect(box).toBeVisible();
        await box.evaluate((element) => {
            element.style.transitionDuration = '100ms';
        });
        await mountButton(page).click();
        await expect(box).toHaveAttribute('data-state', 'closed');
        await box.evaluate(async (element) => {
            element.getAnimations().forEach((animation) => animation.pause());
            await new Promise((resolve) => setTimeout(resolve, 250));
        });
        await expect(box).toBeAttached();
        await box.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
        await expect(box).toHaveCount(0);
    });

    test('an unregistered finite descendant does not acquire the parent lifetime', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-transition-exit');
        await mountButton(page).click();
        const box = page.locator('.waapi-box');
        await expect(box).toBeVisible();
        await box.evaluate((element) => {
            element.style.transition = 'none';
            const child = document.createElement('i');
            element.appendChild(child);
            child.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 10_000 });
        });
        await mountButton(page).click();
        await expect(box).toHaveCount(0, { timeout: 1000 });
    });
});
