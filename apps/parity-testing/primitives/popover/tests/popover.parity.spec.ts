import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { compareObservations, type ExpectedDifference } from '../../../shared/compare.ts';
import { validateExpectedDifferences } from '../../../shared/validate-differences.ts';
import { PopoverDriver } from './driver';
import { scenarios } from './scenarios';

const reference = JSON.parse(readFileSync(new URL('../../../reference.json', import.meta.url), 'utf8'));
const expected: ExpectedDifference[] = JSON.parse(
    readFileSync(new URL('../expected-differences.json', import.meta.url), 'utf8')
);
validateExpectedDifferences(
    expected,
    scenarios.map((s) => s.name)
);
for (const scenario of scenarios)
    test(scenario.name, async ({ browser, baseURL }, info) => {
        const angular = new PopoverDriver(
            await browser.newPage({ baseURL, viewport: { width: 640, height: 480 } }),
            'angular'
        );
        const react = new PopoverDriver(
            await browser.newPage({ baseURL, viewport: { width: 640, height: 480 } }),
            'react'
        );
        const failures: string[] = [];
        try {
            for (const driver of [angular, react])
                try {
                    await driver.goto(scenario.name);
                    expect(driver.metadata?.commit).toBe(reference.commit);
                    expect(driver.metadata?.packageVersion).toBe(reference.packageVersion);
                    await scenario.run(driver);
                } catch (error) {
                    failures.push(`${driver.framework}: ${String(error)}`);
                }
            const comparison = compareObservations(
                scenario.name,
                angular.checkpoints,
                react.checkpoints,
                expected,
                browser.browserType().name()
            );
            for (const category of new Set(comparison.differences.map((d) => d.category)))
                info.annotations.push({ type: 'recorded-difference', description: category });
            await info.attach('observations', {
                contentType: 'application/json',
                body: JSON.stringify(
                    {
                        scenario: scenario.name,
                        browser: { name: browser.browserType().name(), version: browser.version() },
                        reference: react.metadata,
                        angular: {
                            checkpoints: angular.checkpoints,
                            measurements: angular.measurements,
                            nativeEvents: await angular.page.evaluate(() => window.popoverParity?.nativeEvents)
                        },
                        react: {
                            checkpoints: react.checkpoints,
                            measurements: react.measurements,
                            nativeEvents: await react.page.evaluate(() => window.popoverParity?.nativeEvents)
                        },
                        failures,
                        ...comparison
                    },
                    null,
                    2
                )
            });
            expect(failures).toEqual([]);
            expect(comparison.unexpected, 'New or changed differences').toEqual([]);
            expect(comparison.stale, 'Disappeared differences require review').toEqual([]);
        } finally {
            await angular.page.close();
            await react.page.close();
        }
    });
