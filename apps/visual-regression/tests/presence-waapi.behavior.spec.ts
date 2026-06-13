import { expect, Locator, Page, test } from '@playwright/test';

/**
 * ADR 0011 — WAAPI-based exit detection for `PresenceMachine`. These need a real browser: jsdom runs
 * no CSS, so it cannot exercise transitions, descendant keyframes, or the freshness filter. Each
 * fixture lives in `Utilities/Presence` (tagged `!visual`) and is driven through the built Storybook.
 *
 * The headline cases (transition-only exit, popup-level keyframe with no positioner decoy) **fail on
 * `main`** — there the machine watched only the root's computed `animationName` and unmounted
 * instantly.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

const mountButton = (page: Page): Locator => page.getByRole('button');

test.describe('Presence WAAPI exit detection', () => {
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

    test('keyframe exit on a descendant (no positioner decoy) keeps the content mounted', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-subtree-keyframe-exit');

        const root = page.locator('.waapi-root');
        await mountButton(page).click();
        await expect(root).toBeVisible();

        await mountButton(page).click();

        // The exit @keyframes run on a child, not the watched root — subtree detection keeps it up.
        await expect(root).toHaveAttribute('data-state', 'closed');
        await expect(root).toBeAttached();

        await expect(root).toHaveCount(0);
    });

    test('a pre-existing infinite animation does not delay the unmount (freshness filter)', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-infinite-spinner-no-delay');

        const root = page.locator('.waapi-root');
        await mountButton(page).click();
        await expect(root).toBeVisible();

        // The spinner inside has been running since mount; closing has no exit animation of its own.
        await mountButton(page).click();

        // Must unmount promptly — the infinite spinner's startTime predates the close, so it is not
        // mistaken for an exit animation. A short timeout guards against "held open forever".
        await expect(root).toHaveCount(0, { timeout: 1000 });
    });

    test('re-opening during a transition exit keeps the view (version guard, no teardown)', async ({ page }) => {
        await gotoStory(page, 'utilities-presence--waapi-transition-exit');

        const box = page.locator('.waapi-box');
        await mountButton(page).click();
        await expect(box).toBeVisible();

        // Start the exit transition, then immediately re-open before it finishes.
        await mountButton(page).click();
        await expect(box).toHaveAttribute('data-state', 'closed');
        await mountButton(page).click();

        // The re-open bumps the exit version, so the in-flight transition's resolution is ignored and
        // the same element stays mounted and open — no flicker/unmount.
        await expect(box).toHaveAttribute('data-state', 'open');
        await expect(box).toBeAttached();

        // Give the stale transition time to (wrongly) resolve; it must not tear the view down.
        await page.waitForTimeout(400);
        await expect(box).toHaveCount(1);
        await expect(box).toHaveAttribute('data-state', 'open');
    });
});
