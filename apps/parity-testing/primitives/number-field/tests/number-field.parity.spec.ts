import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { cases, type Probe } from '../src/contract';

interface FieldState {
    text: string;
    submitted: FormDataEntryValue[];
    changes: Probe['changes'];
    commits: Probe['commits'];
}

function fieldState(
    value: number | null,
    text = String(value ?? ''),
    changes: Probe['changes'] = [],
    commits: Probe['commits'] = []
): FieldState {
    return { text, submitted: [String(value ?? '')], changes, commits };
}

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

    async type(text: string) {
        // The first focus places the caret at the end. Focus before replacing the full text.
        await this.input.focus();
        await this.input.fill(text);
    }

    async blur() {
        await this.input.press('Tab');
        await expect(this.input).not.toBeFocused();
    }

    async checkpoint(name: string, expected: FieldState) {
        const read = () =>
            this.input.evaluate((input: HTMLInputElement) => ({
                text: input.value,
                submitted: new FormData(input.closest('form')!).getAll('amount'),
                changes: window.numberFieldParity.changes,
                commits: window.numberFieldParity.commits
            }));
        await expect.poll(read, { message: name }).toEqual(expected);
        this.checkpoints.push({ name, state: await read() });
        expect(this.errors).toEqual([]);
    }
}

const defaults = Object.entries(cases).map(([name, options]) => ({
    name,
    async run(driver: NumberFieldDriver) {
        const bound = options.value !== undefined;
        const initial = options.value === undefined ? (options.defaultValue ?? null) : options.value;
        await driver.checkpoint('initialized', fieldState(initial));
        await driver.page.getByRole('button', { name: 'Change default' }).click();
        await driver.checkpoint('late default preserves the initial value', fieldState(initial));
        if (bound) {
            await driver.page.getByRole('button', { name: 'Write value' }).click();
            await driver.checkpoint('external write is silent', fieldState(8));
        }

        await driver.input.press('ArrowUp');
        const edited = bound ? 9 : initial === null ? 0 : initial + 1;
        const editedState = fieldState(edited, String(edited), [{ value: edited, reason: 'keyboard' }], [edited]);
        await driver.checkpoint('accepted edit follows the effective value', editedState);
        await driver.page.getByRole('button', { name: 'Change default' }).click();
        await driver.checkpoint('late default preserves the edited value', editedState);
    }
}));

const editing = [
    {
        name: 'blur-empty',
        async run(d: NumberFieldDriver) {
            await d.input.focus();
            await d.blur();
            await d.checkpoint('untouched empty value stays silent', fieldState(null));
        }
    },
    {
        name: 'blur-precision',
        async run(d: NumberFieldDriver) {
            const value = 1.234567890123456;
            const changes = [{ value, reason: 'input-change' }];
            await d.type(String(value));
            await d.checkpoint('the live value retains all digits', fieldState(value, String(value), changes));
            await d.blur();
            const committed = fieldState(value, '1.235', changes, [value]);
            await d.checkpoint('blur formats the display and commits the exact value', committed);
            await d.input.focus();
            await d.blur();
            await d.checkpoint('a second blur leaves precision and commit count intact', committed);
        }
    },
    {
        name: 'blur-compact-value',
        async run(d: NumberFieldDriver) {
            await d.input.focus();
            await d.blur();
            await d.checkpoint(
                'compact display leaves the supplied numeric value intact',
                fieldState(1234.56789, '1.2K')
            );
        }
    },
    {
        name: 'blur-typed-rounding',
        async run(d: NumberFieldDriver) {
            const changes = [{ value: 1.24, reason: 'input-change' }];
            await d.type('1.239');
            await d.checkpoint(
                'explicit rounding applies to the live numeric value',
                fieldState(1.24, '1.239', changes)
            );
            await d.blur();
            await d.checkpoint('blur formats the draft and commits once', fieldState(1.24, '1.24', changes, [1.24]));
        }
    },
    ...(['blur-external-rounding', 'blur-canceled-rounding'] as const).map((name) => ({
        name,
        async run(d: NumberFieldDriver) {
            const canceled = name === 'blur-canceled-rounding';
            await d.checkpoint('formatted external value is initially untouched', fieldState(1.239, '1.24'));
            await d.input.focus();
            await d.blur();
            await d.checkpoint(
                'commit follows acceptance of explicit rounding',
                fieldState(
                    canceled ? 1.239 : 1.24,
                    '1.24',
                    [{ value: 1.24, reason: 'input-blur' }],
                    canceled ? [] : [1.24]
                )
            );
        }
    })),
    ...(['blur-clear', 'blur-canceled-clear'] as const).map((name) => ({
        name,
        async run(d: NumberFieldDriver) {
            const canceled = name === 'blur-canceled-clear';
            const changes = [{ value: null, reason: 'input-clear' }];
            await d.type('');
            await d.checkpoint('clearing updates the draft before blur', fieldState(canceled ? 6 : null, '', changes));
            await d.blur();
            await d.checkpoint(
                'blur commits an accepted clear only',
                fieldState(
                    canceled ? 6 : null,
                    '',
                    canceled ? [...changes, ...changes] : changes,
                    canceled ? [] : [null]
                )
            );
        }
    })),
    {
        name: 'blur-partial-draft',
        async run(d: NumberFieldDriver) {
            await d.type('-');
            await d.blur();
            await d.checkpoint('partial draft neither overwrites nor commits a number', fieldState(6, '-'));
        }
    }
];

const scenarios = [...defaults, ...editing];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new NumberFieldDriver(page, framework),
    readNativeEvents: (driver) => driver.page.evaluate(() => window.numberFieldParity.nativeEvents)
});

for (const scenario of scenarios) {
    test(scenario.name, async ({ browser, baseURL }, info) => run(scenario, { browser, baseURL }, info));
}
