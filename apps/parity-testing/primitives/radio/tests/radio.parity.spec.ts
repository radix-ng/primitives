import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { cases, options, type Probe } from '../src/contract';

class RadioDriver {
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

    get group() {
        return this.page.getByRole('radiogroup', { name: 'Density' });
    }

    async goto(name: string) {
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.group.getByRole('radio')).toHaveCount(options.length);
        this.metadata = await this.page.evaluate(() => window.radioParity.reference);
    }

    async checkpoint(name: string, value: string | null, changes: string[] = []) {
        const read = () =>
            this.group.evaluate((group) => ({
                items: Array.from(group.querySelectorAll('[role=radio]'), (item) => ({
                    checked: item.getAttribute('aria-checked'),
                    dataChecked: item.hasAttribute('data-checked'),
                    dataUnchecked: item.hasAttribute('data-unchecked')
                })),
                inputs: Array.from(group.querySelectorAll<HTMLInputElement>('input[type=radio]'), (input) => ({
                    checked: input.checked,
                    value: input.value
                })),
                submitted: new FormData(group.closest('form')!).getAll('density'),
                changes: window.radioParity.changes
            }));
        await expect.poll(read).toEqual({
            items: options.map((option) => ({
                checked: String(option.value === value),
                dataChecked: option.value === value,
                dataUnchecked: option.value !== value
            })),
            inputs: options.map((option) => ({ checked: option.value === value, value: option.value })),
            submitted: value === null ? [] : [value],
            changes: changes.map((next) => ({ value: next, reason: 'none' }))
        });
        this.checkpoints.push({ name, state: await read() });
        expect(this.errors).toEqual([]);
    }
}

const scenarios = Object.entries(cases).map(([name, settings]) => ({
    name,
    async run(driver: RadioDriver) {
        const supplied = 'value' in settings;
        let selected = supplied ? settings.value : 'defaultValue' in settings ? settings.defaultValue : null;
        await driver.checkpoint('initialized', selected);
        await driver.page.getByRole('button', { name: 'Change default' }).click();
        await driver.checkpoint('late default preserves selection', selected);
        if (supplied) {
            await driver.page.getByRole('button', { name: 'Write value' }).click();
            selected = 'standard';
            await driver.checkpoint('external write is silent', selected);
        }

        const edited = selected === 'compact' ? 'standard' : 'compact';
        const item = driver.group.getByRole('radio', { name: edited === 'compact' ? 'Compact' : 'Standard' });
        await driver.page.evaluate(() => {
            window.radioParity.cancelNext = true;
        });
        await item.click();
        await driver.checkpoint('veto keeps selection and serialization', selected, [edited]);
        await item.click();
        await driver.checkpoint('accepted click updates selection once', edited, [edited, edited]);
        await driver.page.getByRole('button', { name: 'Change default' }).click();
        await driver.checkpoint('late default preserves accepted selection', edited, [edited, edited]);
    }
}));

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new RadioDriver(page, framework),
    readNativeEvents: (driver) => driver.page.evaluate(() => window.radioParity.nativeEvents)
});

for (const scenario of scenarios) {
    test(scenario.name, async ({ browser, baseURL }, info) => run(scenario, { browser, baseURL }, info));
}
