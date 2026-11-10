import { test } from '@playwright/test';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { PopoverDriver } from './driver';
import { scenarios } from './scenarios';

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new PopoverDriver(page, framework),
    readNativeEvents: (driver) => driver.page.evaluate(() => window.popoverParity?.nativeEvents)
});
for (const scenario of scenarios)
    test(scenario.name, async ({ browser, baseURL }, info) => {
        await run(scenario, { browser, baseURL }, info);
    });
