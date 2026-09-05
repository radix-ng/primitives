import { expect, test } from '@playwright/test';

/**
 * `rdxPlatform` (`core/src/dom/platform.ts`) tells WebKit from Blink with a CSS probe —
 * `CSS.supports('-webkit-backdrop-filter: none')` — because every Chromium UA also carries a `Safari`
 * token. The whole distinction rests on Blink shipping only the unprefixed property, and four call
 * sites change behavior when it flips (the scroll-lock pinch-zoom bail-out, the scroll-lock overlay
 * strategy, the 5ms IME guard in `RdxDismiss`, and number-field's pointer-lock opt-out).
 *
 * jsdom has no `CSS` object at all, so the unit suite cannot see any of this — it lives here.
 */
test.describe('platform detection', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/iframe.html?id=components-button--default&viewMode=story');
    });

    test('the WebKit probe stays negative in Blink', async ({ page, browserName }) => {
        const supportsPrefixed = await page.evaluate(() => CSS.supports('-webkit-backdrop-filter:none'));
        expect(supportsPrefixed).toBe(browserName === 'webkit');
    });

    test('the user agent alone could not tell the engines apart', async ({ page, browserName }) => {
        // Documents why the probe exists: Chromium advertises `Safari`, so a `Safari`-token check
        // (what these call sites used to do) matches Blink as well.
        const userAgent = await page.evaluate(() => navigator.userAgent);
        expect(userAgent).toContain('Safari');
        if (browserName === 'chromium') {
            expect(userAgent).toMatch(/Chrome|Chromium/);
        }
    });
});
