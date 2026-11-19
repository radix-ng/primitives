import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { cases, type Probe } from '../src/contract';

class NumberFieldDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Probe['reference'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get input() {
        return this.page.getByRole('textbox', { name: 'Amount' });
    }

    async goto(name: string) {
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.input).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.numberFieldParity.reference);
    }

    async checkpoint(name: string, value: number | null, edits: number[] = []) {
        const text = value === null ? '' : String(value);
        await expect(this.input).toHaveValue(text);
        const state = await this.input.evaluate((input: HTMLInputElement) => ({
            text: input.value,
            submitted: new FormData(input.closest('form')!).getAll('amount'),
            changes: window.numberFieldParity.changes,
            commits: window.numberFieldParity.commits
        }));
        this.checkpoints.push({ name, state });
        expect(state).toEqual({
            text,
            submitted: [text],
            changes: edits.map((next) => ({ value: next, reason: 'keyboard' })),
            commits: edits
        });
        expect(this.errors).toEqual([]);
    }
}

const scenarios = Object.entries(cases).map(([name, options]) => ({
    name,
    async run(driver: NumberFieldDriver) {
        const bound = options.value !== undefined;
        const initial = options.value === undefined ? (options.defaultValue ?? null) : options.value;
        await driver.checkpoint('initialized', initial);
        await driver.page.getByRole('button', { name: 'Change default' }).click();
        await driver.checkpoint('late default preserves the initial value', initial);
        if (bound) {
            await driver.page.getByRole('button', { name: 'Write value' }).click();
            await driver.checkpoint('external write is silent', 8);
        }

        await driver.input.press('ArrowUp');
        const edited = bound ? 9 : initial === null ? 0 : initial + 1;
        await driver.checkpoint('accepted edit follows the effective value', edited, [edited]);
        await driver.page.getByRole('button', { name: 'Change default' }).click();
        await driver.checkpoint('late default preserves the edited value', edited, [edited]);
    }
}));

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new NumberFieldDriver(page, framework),
    readNativeEvents: (driver) => driver.page.evaluate(() => window.numberFieldParity.nativeEvents)
});

for (const scenario of scenarios) {
    test(scenario.name, async ({ browser, baseURL }, info) => run(scenario, { browser, baseURL }, info));
}
