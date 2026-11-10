import { test } from '@playwright/test';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { MenuDriver } from './driver';
import { scenarios } from './scenarios';

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    viewport: { width: 800, height: 600 },
    createDriver: (page, framework) => new MenuDriver(page, framework),
    readNativeEvents: (driver) =>
        driver.page.evaluate(() => ({
            changes: window.menuParity?.nativeEvents,
            pointerMoves: window.menuParity?.pointerMoves
        }))
});
for (const scenario of scenarios)
    test(scenario.name, async ({ browser, baseURL }, info) => {
        await run(scenario, { browser, baseURL }, info);
    });
