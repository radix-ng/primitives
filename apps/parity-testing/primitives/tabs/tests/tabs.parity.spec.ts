import { test } from '@playwright/test';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { activationCases } from '../src/activation';
import { TabsDriver } from './driver';
import { scenarios } from './scenarios';

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new TabsDriver(page, framework),
    pageOptions: (name) => ({
        hasTouch:
            activationCases[name as keyof typeof activationCases]?.activation?.gesture?.startsWith('touch-') ?? false
    }),
    readNativeEvents: (driver) => driver.page.evaluate(() => window.tabsParity?.nativeEvents)
});
for (const scenario of scenarios)
    test(scenario.name, async ({ browser, baseURL }, info) => {
        const gesture = activationCases[scenario.name as keyof typeof activationCases]?.activation?.gesture;
        const engine = browser.browserType().name();
        test.skip(
            gesture?.startsWith('touch-') && engine === 'firefox',
            'Playwright Firefox does not support hasTouch contexts'
        );
        test.skip(
            gesture === 'touch-cancel' && engine !== 'chromium',
            'Native touch cancellation requires Chromium CDP'
        );
        test.skip(gesture === 'pen-tap' && engine !== 'chromium', 'Native pen input requires Chromium CDP');
        await run(scenario, { browser, baseURL }, info);
    });
