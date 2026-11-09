import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { compareObservations } from '../../../shared/compare.ts';
import { SelectDriver } from './driver';
import { scenarios } from './scenarios';

const reference = JSON.parse(readFileSync(new URL('../../../reference.json', import.meta.url), 'utf8'));
const expected = JSON.parse(readFileSync(new URL('../expected-differences.json', import.meta.url), 'utf8'));

const exceptionKeys = new Set<string>();
for (const entry of expected) {
    if (entry.browser && !['chromium', 'firefox', 'webkit'].includes(entry.browser))
        throw new Error(`Unknown difference browser: ${entry.browser}`);
    const key = JSON.stringify([entry.scenario, entry.checkpoint, entry.field, entry.browser]);
    if (exceptionKeys.has(key)) throw new Error(`Duplicate difference: ${key}`);
    if (
        expected.some(
            (other) =>
                other !== entry &&
                other.scenario === entry.scenario &&
                other.checkpoint === entry.checkpoint &&
                other.field === entry.field &&
                (!other.browser || !entry.browser)
        )
    )
        throw new Error(`Overlapping browser difference: ${key}`);
    if (!scenarios.some((scenario) => scenario.name === entry.scenario))
        throw new Error(`Difference refers to a missing scenario: ${entry.scenario}`);
    exceptionKeys.add(key);
}

for (const scenario of scenarios) {
    test(scenario.name, async ({ browser, baseURL }, testInfo) => {
        const engine = browser.browserType().name();
        test.skip(!!scenario.input && engine === 'firefox', 'Playwright Firefox does not support hasTouch contexts');
        test.skip(
            scenario.input === 'touch-gesture' && engine !== 'chromium',
            'Native touch move/cancel uses Chromium CDP; no public WebKit gesture API'
        );
        const options = { baseURL, hasTouch: !!scenario.input, viewport: scenario.viewport };
        const angular = new SelectDriver(await browser.newPage(options), 'angular');
        const react = new SelectDriver(await browser.newPage(options), 'react');
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
            const comparison = compareObservations(
                scenario.name,
                angular.checkpoints,
                react.checkpoints,
                expected,
                engine
            );
            const sizingComparison: { name: string; metric: string; angular: number; react: number; delta: number }[] =
                [];
            if (scenario.compareSizing) {
                const measured = ['initial sizing', 'expanded', 'height cap', 'reopened'];
                for (const name of measured) {
                    const a = angular.measurements.find((m) => m.name === name)?.bounds as
                        | Record<string, any>
                        | undefined;
                    const b = react.measurements.find((m) => m.name === name)?.bounds as
                        | Record<string, any>
                        | undefined;
                    if (!a && !b) continue;
                    if (!a || !b) {
                        failures.push(`Missing sizing checkpoint: ${name}`);
                        continue;
                    }
                    for (const metric of [
                        'positioner.x',
                        'positioner.y',
                        'positioner.width',
                        'positioner.height',
                        'popup.x',
                        'popup.y',
                        'popup.width',
                        'popup.height',
                        'scrollTop',
                        'clientHeight'
                    ]) {
                        const read = (value: Record<string, any>) =>
                            metric.split('.').reduce((v, key) => v[key], value) as number;
                        const av = read(a),
                            rv = read(b);
                        const delta = Math.abs(av - rv);
                        sizingComparison.push({ name, metric, angular: av, react: rv, delta });
                        if (!Number.isFinite(delta) || delta > 2)
                            failures.push(`Sizing ${name}/${metric}: Angular ${av}, Base UI ${rv}`);
                    }
                }
            }
            for (const category of new Set<string>(comparison.differences.map((difference) => difference.category))) {
                testInfo.annotations.push({ type: 'recorded-difference', description: category });
            }
            await testInfo.attach('observations', {
                body: JSON.stringify(
                    {
                        scenario: scenario.name,
                        browser: { name: browser.browserType().name(), version: browser.version() },
                        input: { mode: scenario.input ?? 'desktop', hasTouch: !!scenario.input, mobileViewport: false },
                        reference: react.metadata?.reference,
                        angular: {
                            checkpoints: angular.checkpoints,
                            nativeEvents: await angular.nativeEvents(),
                            inputEvents: await angular.inputEvents(),
                            errors: angular.errors,
                            measurements: angular.measurements
                        },
                        react: {
                            checkpoints: react.checkpoints,
                            nativeEvents: await react.nativeEvents(),
                            inputEvents: await react.inputEvents(),
                            errors: react.errors,
                            measurements: react.measurements
                        },
                        failures,
                        sizingComparison,
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
