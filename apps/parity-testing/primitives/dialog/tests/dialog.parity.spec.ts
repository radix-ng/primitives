import { test } from '@playwright/test';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { touchMode } from '../src/contract';
import { DialogDriver } from './driver';
import { scenarios } from './scenarios';

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    pageOptions: (name) => ({ hasTouch: !!touchMode(name) }),
    createDriver: (page, framework) => new DialogDriver(page, framework),
    readNativeEvents: (driver) =>
        driver.page.evaluate(() => ({
            changeEvents: window.dialogParity?.nativeEvents,
            touchEvents: window.dialogParity?.touchEvents
        }))
});

for (const scenario of scenarios) {
    test(scenario.name, async ({ browser, baseURL }, info) => {
        const touch = touchMode(scenario.name);
        const engine = browser.browserType().name();
        test.skip(!!touch && engine === 'firefox', 'Playwright Firefox does not support hasTouch contexts');
        test.skip(
            !!touch && touch !== 'tap' && engine !== 'chromium',
            'Trusted pan, cancellation and multi-touch use Chromium CDP'
        );
        await run(scenario, { browser, baseURL }, info);
    });
}
