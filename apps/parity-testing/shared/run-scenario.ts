import { expect, type Browser, type Page, type TestInfo } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { compareObservations, type Checkpoint, type ExpectedDifference } from './compare.ts';
import { validateExpectedDifferences } from './validate-differences.ts';

export interface ParityDriver {
    readonly framework: 'angular' | 'react';
    readonly page: Page;
    readonly checkpoints: Checkpoint[];
    readonly measurements: unknown[];
    readonly metadata?: { commit: string; packageVersion: string; digest: string };
    goto(name: string): Promise<void>;
}

/** Shared test/report lifecycle only. Each primitive owns its actions, DOM and recording contract. */
export function createParityRunner<Driver extends ParityDriver>(config: {
    differences: URL;
    scenarios: readonly { name: string; run(driver: Driver): Promise<void> }[];
    createDriver: (page: Page, framework: 'angular' | 'react') => Driver;
    readNativeEvents: (driver: Driver) => Promise<unknown>;
    viewport?: { width: number; height: number };
}) {
    const reference = JSON.parse(readFileSync(new URL('../reference.json', import.meta.url), 'utf8'));
    const expected: ExpectedDifference[] = JSON.parse(readFileSync(config.differences, 'utf8'));
    validateExpectedDifferences(
        expected,
        config.scenarios.map((s) => s.name)
    );
    return async (
        scenario: { name: string; run(driver: Driver): Promise<void> },
        { browser, baseURL }: { browser: Browser; baseURL?: string },
        info: TestInfo
    ) => {
        const viewport = config.viewport ?? { width: 640, height: 480 };
        const angular = config.createDriver(await browser.newPage({ baseURL, viewport }), 'angular');
        const react = config.createDriver(await browser.newPage({ baseURL, viewport }), 'react');
        const failures: string[] = [];
        try {
            for (const driver of [angular, react]) {
                try {
                    await driver.goto(scenario.name);
                    expect(driver.metadata?.commit).toBe(reference.commit);
                    expect(driver.metadata?.packageVersion).toBe(reference.packageVersion);
                    await scenario.run(driver);
                } catch (error) {
                    failures.push(`${driver.framework}: ${String(error)}`);
                }
            }
            if (angular.metadata?.digest !== react.metadata?.digest) failures.push('Reference digest mismatch');
            const comparison = compareObservations(
                scenario.name,
                angular.checkpoints,
                react.checkpoints,
                expected,
                browser.browserType().name()
            );
            for (const category of new Set(comparison.differences.map((d) => d.category))) {
                info.annotations.push({ type: 'recorded-difference', description: category });
            }
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
                            nativeEvents: await config.readNativeEvents(angular)
                        },
                        react: {
                            checkpoints: react.checkpoints,
                            measurements: react.measurements,
                            nativeEvents: await config.readNativeEvents(react)
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
    };
}
