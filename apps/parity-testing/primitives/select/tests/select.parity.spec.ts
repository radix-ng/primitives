import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { compareObservations } from '../../../shared/compare.ts';
import { SelectDriver } from './driver';
import { scenarios } from './scenarios';

const reference = JSON.parse(readFileSync(new URL('../../../reference.json', import.meta.url), 'utf8'));
const expected = JSON.parse(readFileSync(new URL('../expected-differences.json', import.meta.url), 'utf8'));

const exceptionKeys = new Set<string>();
for (const entry of expected) {
    const key = JSON.stringify([entry.scenario, entry.checkpoint, entry.field]);
    if (exceptionKeys.has(key)) throw new Error(`Duplicate difference: ${key}`);
    if (!scenarios.some((scenario) => scenario.name === entry.scenario))
        throw new Error(`Difference refers to a missing scenario: ${entry.scenario}`);
    exceptionKeys.add(key);
}

for (const scenario of scenarios) {
    test(scenario.name, async ({ browser, baseURL }, testInfo) => {
        const angular = new SelectDriver(await browser.newPage({ baseURL }), 'angular');
        const react = new SelectDriver(await browser.newPage({ baseURL }), 'react');
        const failures: string[] = [];
        try {
            // Collect both sides even if a shared contract assertion fails on one implementation.
            for (const driver of [angular, react]) {
                try {
                    await driver.goto(scenario.fixture);
                    expect(driver.metadata?.reference.commit).toBe(reference.commit);
                    expect(driver.metadata?.reference.packageVersion).toBe(reference.packageVersion);
                    await scenario.run(driver);
                } catch (error) {
                    failures.push(`${driver.framework}: ${String(error)}`);
                }
            }
            const comparison = compareObservations(scenario.name, angular.checkpoints, react.checkpoints, expected);
            for (const category of new Set<string>(comparison.differences.map((difference) => difference.category))) {
                testInfo.annotations.push({ type: 'recorded-difference', description: category });
            }
            await testInfo.attach('observations', {
                body: JSON.stringify(
                    {
                        scenario: scenario.name,
                        browser: { name: browser.browserType().name(), version: browser.version() },
                        reference: react.metadata?.reference,
                        angular: {
                            checkpoints: angular.checkpoints,
                            nativeEvents: await angular.nativeEvents(),
                            errors: angular.errors,
                            measurements: angular.measurements
                        },
                        react: {
                            checkpoints: react.checkpoints,
                            nativeEvents: await react.nativeEvents(),
                            errors: react.errors,
                            measurements: react.measurements
                        },
                        failures,
                        ...comparison
                    },
                    null,
                    2
                ),
                contentType: 'application/json'
            });
            expect(failures).toEqual([]);
            expect(comparison.unexpected, 'New or changed differences').toEqual([]);
            expect(comparison.stale, 'Differences disappeared; review and remove their exceptions').toEqual([]);
        } finally {
            await angular.page.close();
            await react.page.close();
        }
    });
}
