import { test } from '@playwright/test';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { AutocompleteDriver } from './driver';
import { scenarios } from './scenarios';
const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new AutocompleteDriver(page, framework),
    readNativeEvents: (driver) => driver.page.evaluate(() => window.autocompleteParity.details)
});
for (const scenario of scenarios)
    test(scenario.name, async ({ browser, baseURL }, info) => {
        await run(scenario, { browser, baseURL }, info);
    });
