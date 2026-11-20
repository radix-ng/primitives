import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import type { Change } from '../src/contract';

type Checked = 'true' | 'false' | 'mixed';

const change = (part: string, value: Change['value']): Change => ({
    part,
    value,
    reason: 'none',
    eventType: 'click'
});

class CheckboxDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['checkboxParity']['reference'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get terms() {
        return this.page.locator('#terms');
    }

    item(name: string) {
        return this.page.getByRole('checkbox', { name, exact: true });
    }

    async goto(name: string) {
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.page.getByRole('checkbox')).toHaveCount(name.startsWith('group-') ? 3 : 1);
        this.metadata = await this.page.evaluate(() => window.checkboxParity.reference);
    }

    async standalone(name: string, checked: Checked, expectedChanges: Change[], submitted?: string[]) {
        const read = () =>
            this.terms.evaluate((button) => ({
                checked: button.getAttribute('aria-checked'),
                attributes: ['data-checked', 'data-unchecked', 'data-indeterminate'].filter((attr) =>
                    button.hasAttribute(attr)
                ),
                submitted: new FormData(document.querySelector('form')!).getAll('terms'),
                native: document.querySelector<HTMLInputElement>('input[type=checkbox]')?.checked,
                mixed: document.querySelector<HTMLInputElement>('input[type=checkbox]')?.indeterminate,
                changes: window.checkboxParity.changes
            }));
        await expect.poll(read, name).toEqual({
            checked,
            attributes: [
                checked === 'mixed' ? 'data-indeterminate' : checked === 'true' ? 'data-checked' : 'data-unchecked'
            ],
            submitted: submitted ?? (checked === 'true' ? ['yes'] : []),
            native: checked === 'true',
            mixed: checked === 'mixed',
            changes: expectedChanges
        });
        this.checkpoints.push({ name, state: await read() });
    }

    async group(name: string, checked: Checked[], expectedChanges: Change[], ids = 'option-a option-b') {
        const read = () =>
            this.page.getByRole('group').evaluate((group) => {
                const [parent, ...items] = group.querySelectorAll('[role=checkbox]');
                return {
                    checked: [parent, ...items].map((item) => item.getAttribute('aria-checked')),
                    controls: parent.getAttribute('aria-controls'),
                    changes: window.checkboxParity.changes
                };
            });
        await expect.poll(read, name).toEqual({ checked, controls: ids, changes: expectedChanges });
        this.checkpoints.push({ name, state: await read() });
    }

    async cancel(part: string) {
        await this.page.evaluate((part) => {
            window.checkboxParity.cancelPart = part;
        }, part);
    }
}

const scenarios: { name: string; run(driver: CheckboxDriver): Promise<void> }[] = [
    {
        name: 'default',
        async run(driver) {
            await driver.standalone('initial default', 'true', []);
            await driver.page.getByRole('button', { name: 'Change default' }).click();
            await driver.standalone('late default ignored', 'true', []);
            await driver.terms.press('Space');
            await driver.standalone('Space toggles once', 'false', [change('terms', false)]);
            expect(await driver.page.evaluate(() => window.checkboxParity.native)).toEqual(['input', 'change']);
        }
    },
    {
        name: 'controlled',
        async run(driver) {
            await driver.standalone('explicit false precedes default', 'false', []);
            const requested = change('terms', true);
            await driver.terms.click();
            await driver.standalone('request held by parent', 'false', [requested]);
            await driver.terms.press('Space');
            await driver.standalone('repeat request', 'false', [requested, requested]);
            await driver.page.getByRole('button', { name: 'Apply request' }).click();
            await driver.standalone('parent accepts later', 'true', [requested, requested]);
        }
    },
    {
        name: 'mixed',
        async run(driver) {
            await driver.standalone('indeterminate', 'mixed', []);
            await driver.terms.click();
            const first = change('terms', true);
            const read = () =>
                driver.terms.evaluate((button) => ({
                    checked: button.getAttribute('aria-checked'),
                    submitted: new FormData(document.querySelector('form')!).getAll('terms'),
                    native: document.querySelector<HTMLInputElement>('input[type=checkbox]')?.checked,
                    mixed: document.querySelector<HTMLInputElement>('input[type=checkbox]')?.indeterminate,
                    changes: window.checkboxParity.changes
                }));
            await expect
                .poll(read)
                .toEqual({ checked: 'mixed', submitted: ['yes'], native: true, mixed: true, changes: [first] });
            driver.checkpoints.push({ name: 'mixed prop persists with checked value', state: await read() });
            await driver.terms.click();
            await driver.standalone('native checked value flips again', 'mixed', [first, change('terms', false)]);
        }
    },
    ...['disabled', 'readonly'].map((name) => ({
        name,
        async run(driver: CheckboxDriver) {
            await driver.terms.click({ force: true });
            await driver.terms.press('Space');
            await driver.standalone('ignores pointer and Space', 'false', []);
            if (name === 'disabled') await expect(driver.terms).toBeDisabled();
            else await expect(driver.terms).toHaveAttribute('aria-readonly', 'true');
        }
    })),
    {
        name: 'form',
        async run(driver) {
            const { page, terms } = driver;
            await driver.standalone('unchecked fallback', 'false', [], ['no']);
            await terms.press('Enter');
            expect(await page.evaluate(() => document.querySelector('form')?.checkValidity())).toBe(false);
            await expect(terms).toBeFocused();
            await page.locator('label[for=terms]').click();
            await driver.standalone('label activation', 'true', [change('terms', true)]);
            await terms.press('Enter');
            await expect
                .poll(() => page.evaluate(() => window.checkboxParity.native))
                .toEqual(['input', 'change', 'submit:submit']);
            await page.evaluate(() => {
                window.checkboxParity.cancelEnter = true;
            });
            await terms.press('Enter');
            await driver.standalone('Enter does not toggle', 'true', [change('terms', true)]);
            expect(await page.evaluate(() => window.checkboxParity.native)).toEqual([
                'input',
                'change',
                'submit:submit'
            ]);
        }
    },
    {
        name: 'indicator',
        async run(driver) {
            const indicator = driver.page.getByTestId('indicator');
            await expect(indicator).toHaveAttribute('data-unchecked', '');
            await expect(indicator).not.toHaveAttribute('data-ending-style', '');
            await driver.terms.click();
            await expect(indicator).toHaveAttribute('data-checked', '');
            await driver.terms.click();
            await expect(indicator).toHaveAttribute('data-ending-style', '');
            await expect(indicator).not.toHaveAttribute('data-ending-style', '');
            await expect(indicator).toHaveAttribute('data-unchecked', '');
            await driver.standalone('exit completion settles indicator state', 'false', [
                change('terms', true),
                change('terms', false)
            ]);
        }
    },
    {
        name: 'group-cycle',
        async run(driver) {
            const parent = driver.item('All');
            await driver.group('initial mixed selection', ['mixed', 'false', 'true'], []);
            await driver.page.getByRole('button', { name: 'Change default' }).click();
            await driver.group('late group default is ignored', ['mixed', 'false', 'true'], []);
            await driver.cancel('parent');
            await parent.click();
            const changes = [change('parent', true)];
            await driver.group('parent veto precedes group callback', ['mixed', 'false', 'true'], changes);
            await driver.cancel('group');
            await parent.click();
            changes.push(change('parent', true), change('group', ['a', 'b']));
            await driver.group('group veto preserves mixed cycle', ['mixed', 'false', 'true'], changes);
            await parent.press('Space');
            changes.push(change('parent', true), change('group', ['a', 'b']));
            await driver.group('select all', ['true', 'true', 'true'], changes);
            await parent.click();
            changes.push(change('parent', false), change('group', []));
            await driver.group('select none', ['false', 'false', 'false'], changes);
            await parent.click();
            changes.push(change('parent', true), change('group', ['b']));
            await driver.group('restore partial selection', ['mixed', 'false', 'true'], changes);
            await driver.page.getByRole('button', { name: 'Remove b' }).click();
            await driver.group('removed child id is released', ['mixed', 'false'], changes, 'option-a');
        }
    },
    {
        name: 'group-controlled',
        async run(driver) {
            await driver.group('explicit empty selection precedes default', ['false', 'false', 'false'], []);
            const item = driver.item('a');
            const changes = [change('a', true)];
            await driver.cancel('a');
            await item.click();
            await driver.group('child veto prevents group request', ['false', 'false', 'false'], changes);
            await item.click();
            changes.push(change('a', true), change('group', ['a']));
            await driver.group('group waits for parent write', ['false', 'false', 'false'], changes);
            await driver.page.getByRole('button', { name: 'Apply request' }).click();
            await driver.group('apply requested selection', ['mixed', 'true', 'false'], changes);
        }
    },
    {
        name: 'group-form',
        async run(driver) {
            const read = () =>
                driver.page
                    .locator('form')
                    .evaluate((form) => new FormData(form as HTMLFormElement).getAll('features'));
            await expect.poll(read).toEqual(['b']);
            await driver.item('a').click();
            await expect.poll(read).toEqual(['a', 'b']);
            driver.checkpoints.push({
                name: 'named children submit in document order',
                state: { values: await read() }
            });
        }
    },
    {
        name: 'group-disabled-child',
        async run(driver) {
            const parent = driver.item('All');
            await expect(driver.item('b')).toBeDisabled();
            await parent.click();
            const changes = [change('parent', true), change('group', ['a', 'b'])];
            await driver.group('select all with disabled item', ['true', 'true', 'true'], changes);
            await parent.click();
            changes.push(change('parent', false), change('group', ['b']));
            await driver.group('disabled selection preserved', ['mixed', 'false', 'true'], changes);
        }
    }
];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new CheckboxDriver(page, framework),
    readNativeEvents: (driver) => driver.page.evaluate(() => window.checkboxParity.native)
});

for (const scenario of scenarios) {
    test(scenario.name, async ({ browser, baseURL }, info) =>
        run(
            {
                ...scenario,
                async run(driver) {
                    await scenario.run(driver);
                    expect(driver.errors).toEqual([]);
                }
            },
            { browser, baseURL },
            info
        )
    );
}
