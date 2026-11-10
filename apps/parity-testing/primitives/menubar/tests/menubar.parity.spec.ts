import { test } from '@playwright/test';
import { createParityRunner } from '../../../shared/run-scenario';
import { MenubarDriver, scenarios } from './scenarios';
const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    viewport: { width: 800, height: 600 },
    createDriver: (page, framework) => new MenubarDriver(page, framework),
    readNativeEvents: (driver) =>
        driver.page.evaluate(() => ({
            changes: window.menubarParity.nativeEvents,
            pointerMoves: window.menubarParity.pointerMoves,
            gestures: window.menubarParity.gestures
        }))
});
for (const scenario of scenarios)
    test(scenario.name, async ({ browser, baseURL }, info) => {
        await run(scenario, { browser, baseURL }, info);
    });
