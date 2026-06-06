import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression for Radix NG primitives.
 *
 * Screenshots are taken against the *built* Storybook (`dist/radix-storybook`), served as static
 * files. Baselines are committed next to each spec in `*-snapshots/`. Playwright suffixes every
 * snapshot with the project + platform (e.g. `…-chromium-darwin.png`), so macOS and Linux/CI
 * baselines can coexist — regenerate the Linux set in the official Playwright Docker image when
 * wiring CI.
 */
const PORT = 4400;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: './tests',
    outputDir: './test-results',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
    use: {
        baseURL: BASE_URL,
        colorScheme: 'light',
        trace: 'on-first-retry'
    },
    expect: {
        toHaveScreenshot: {
            // Freeze CSS animations/transitions at their end state for deterministic, settled-state
            // screenshots. We assert the final visual (positioning, open/closed look), not mid-motion.
            animations: 'disabled',
            maxDiffPixelRatio: 0.01
        }
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],
    webServer: {
        command: `pnpm exec http-server ../../dist/radix-storybook -p ${PORT} -s -c-1`,
        url: `${BASE_URL}/index.json`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});
