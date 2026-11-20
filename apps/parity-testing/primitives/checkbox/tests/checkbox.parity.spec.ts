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

interface AccessibleControl {
    role: string;
    name: string;
    description: string;
    checked: string | null;
    disabled: boolean;
    focused: boolean;
    invalid: boolean;
    controls: string[];
}

async function readAccessibleControls(page: Page): Promise<AccessibleControl[]> {
    const session = await page.context().newCDPSession(page);
    try {
        const { nodes } = await session.send('Accessibility.getFullAXTree');
        return nodes
            .filter((node) => !node.ignored && ['checkbox', 'group'].includes(node.role?.value))
            .map((node) => {
                const property = (name: string) => node.properties?.find((entry) => entry.name === name)?.value;
                return {
                    role: node.role?.value,
                    name: node.name?.value ?? '',
                    description: node.description?.value ?? '',
                    checked: property('checked')?.value ?? null,
                    disabled: property('disabled')?.value === true,
                    focused: property('focused')?.value === true,
                    invalid: property('invalid')?.value === 'true',
                    controls: property('controls')?.relatedNodes?.flatMap((target) => target.idref ?? []) ?? []
                };
            });
    } finally {
        await session.detach();
    }
}

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
        await expect(this.page.getByRole('checkbox')).toHaveCount(
            name.startsWith('group-') || name.startsWith('field-group') ? 3 : 1
        );
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

    async fieldCheckpoint(name: string, attributes: string[], submitted: string[]) {
        const read = () =>
            this.page.getByTestId('field').evaluate((field) => {
                const stateAttributes = ['data-dirty', 'data-filled', 'data-focused', 'data-touched'];
                const activeAttributes = (element: Element) =>
                    stateAttributes.filter((attribute) => element.hasAttribute(attribute));
                const parts = [
                    ...field.querySelectorAll('[role="checkbox"], [role="group"], [data-testid="indicator"]')
                ];
                const form = field.closest('form');
                return {
                    field: activeAttributes(field),
                    controls: parts.map(activeAttributes),
                    submitted: form ? Array.from(new FormData(form).values()) : []
                };
            });
        await expect.poll(read, name).toEqual({
            field: attributes,
            controls: Array(this.page.url().includes('field-group') ? 4 : 2).fill(attributes),
            submitted
        });
        this.checkpoints.push({ name, state: await read() });
    }

    async accessibilityCheckpoint(name: string, expected: Partial<AccessibleControl>[]) {
        if (this.page.context().browser()?.browserType().name() !== 'chromium') return;

        const read = () => readAccessibleControls(this.page);
        await expect.poll(read, name).toMatchObject(expected);
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
    ...[false, true].map((controlled) => ({
        name: controlled ? 'history-controlled' : 'history',
        async run(driver: CheckboxDriver) {
            const { page } = driver;
            const initial = controlled ? 'false' : 'true';
            const edited = controlled ? 'true' : 'false';
            const request = [change('terms', controlled)];

            // Leave for a real document on the same origin so the browser can save form state.
            await page.route('**/history-away', (route) =>
                route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Another page</title>' })
            );
            await driver.standalone('initial selection', initial, []);
            await driver.terms.click();
            if (controlled) await page.getByRole('button', { name: 'Apply request' }).click();
            await driver.standalone('edited selection', edited, request);

            const initialDocument = await page.evaluate(() => performance.timeOrigin);
            await page.goto('/history-away');
            await page.goBack();
            const retained = (await page.evaluate(() => performance.timeOrigin)) === initialDocument;
            driver.measurements.push({ navigation: 'back', retainedDocument: retained });
            await driver.standalone(
                'history traversal keeps the form and checkbox in sync',
                retained ? edited : initial,
                retained ? request : []
            );
            expect(await page.evaluate(() => window.checkboxParity.native)).toEqual(
                retained ? ['input', 'change'] : []
            );

            await page.reload();
            await driver.standalone('reload starts from the application value', initial, []);
            expect(await page.evaluate(() => window.checkboxParity.native)).toEqual([]);
        }
    })),
    {
        name: 'mixed',
        async run(driver) {
            await driver.standalone('indeterminate', 'mixed', []);
            await expect(driver.terms).toMatchAriaSnapshot('- checkbox "Terms" [checked=mixed]');
            await driver.accessibilityCheckpoint('mixed state exposes one accessible checkbox', [
                { role: 'checkbox', name: 'Terms', checked: 'mixed' }
            ]);
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
            if (name === 'disabled') {
                await expect(driver.terms).toBeDisabled();
                await expect(driver.terms).toMatchAriaSnapshot('- checkbox "Terms" [disabled]');
                await driver.accessibilityCheckpoint('disabled native button is one accessible checkbox', [
                    { role: 'checkbox', name: 'Terms', disabled: true, checked: 'false' }
                ]);
            } else {
                await expect(driver.terms).toHaveAttribute('aria-readonly', 'true');
            }
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
        name: 'field-standalone',
        async run(driver) {
            const { page } = driver;
            const checkbox = driver.item('Terms');
            await expect(checkbox).toHaveAttribute('aria-labelledby', 'terms-label');
            await expect(checkbox).toHaveAttribute('aria-describedby', 'extra-description terms-description');
            await expect(page.locator('#terms-label')).toHaveAttribute('for', 'terms');
            await expect(page.locator('input[type=checkbox]')).toHaveAttribute('name', 'terms');
            await driver.fieldCheckpoint('empty field', [], []);

            await checkbox.focus();
            await driver.fieldCheckpoint('focused field', ['data-focused'], []);
            await checkbox.press('Space');
            await driver.fieldCheckpoint('filled field', ['data-dirty', 'data-filled', 'data-focused'], ['yes']);
            await page.getByRole('button', { name: 'Outside' }).focus();
            await driver.fieldCheckpoint('blurred field', ['data-dirty', 'data-filled', 'data-touched'], ['yes']);
            await page.locator('#terms-label').click();
            await expect(checkbox).toHaveAttribute('aria-checked', 'false');
        }
    },
    {
        name: 'field-group',
        async run(driver) {
            const { page } = driver;
            const group = page.getByRole('group', { name: 'Features' });
            const parent = driver.item('All');
            const first = driver.item('Option a');
            const second = driver.item('Option b');
            await expect(group).toHaveAttribute('aria-describedby', 'group-description');
            await expect(page.locator('#group-label')).not.toHaveAttribute('for');
            await expect(parent).not.toHaveAttribute('aria-labelledby');
            await expect(parent).toHaveAttribute('aria-describedby', 'group-description');
            await expect(parent).toHaveAttribute('aria-controls', 'item-a item-b');
            await expect(first).toHaveAttribute('aria-describedby', 'group-description description-a');
            await expect(second).toHaveAttribute('aria-describedby', 'group-description description-b');
            await expect(page.locator('#label-a')).toHaveAttribute('for', 'item-a');
            await expect(page.locator('#label-b')).toHaveAttribute('for', 'item-b');
            await driver.fieldCheckpoint('empty group', [], []);

            await first.focus();
            await first.press('Space');
            await driver.fieldCheckpoint('item fills group', ['data-dirty', 'data-filled', 'data-focused'], ['a']);
            await expect(group).toMatchAriaSnapshot(`
                - group "Features":
                  - checkbox "All" [checked=mixed]
                  - checkbox "Option a" [checked]
                  - checkbox "Option b"
            `);
            await expect(group).toHaveAccessibleDescription('Choose your features.');
            await expect(first).toHaveAccessibleDescription('Choose your features. About a');
            await driver.accessibilityCheckpoint('named group exposes mixed state, controls, and focused item', [
                { role: 'group', name: 'Features', description: 'Choose your features.' },
                { role: 'checkbox', name: 'All', checked: 'mixed', controls: ['item-a', 'item-b'] },
                { role: 'checkbox', name: 'Option a', checked: 'true', focused: true },
                { role: 'checkbox', name: 'Option b', checked: 'false' }
            ]);
            await second.focus();
            await driver.fieldCheckpoint(
                'sibling retains shared focus',
                ['data-dirty', 'data-filled', 'data-focused', 'data-touched'],
                ['a']
            );
            await first.focus();
            await first.press('F2');
            await expect(first).toBeDisabled();
            await expect(second).toBeEnabled();
            await driver.fieldCheckpoint(
                'disabled item releases focus and submission',
                ['data-dirty', 'data-filled', 'data-touched'],
                []
            );
        }
    },
    ...[false, true].map((grouped) => ({
        name: grouped ? 'field-group-required' : 'field-required',
        async run(driver: CheckboxDriver) {
            const { page } = driver;
            const required = driver.item(grouped ? 'Option a' : 'Terms');
            const error = page.locator(grouped ? '#features-error' : '#terms-error');
            const next = grouped ? driver.item('Option b') : page.getByRole('button', { name: 'Outside' });
            const submit = page.getByRole('button', { name: 'Submit' });
            const submissions = page.getByTestId('submissions');
            const fieldName = grouped ? 'features' : 'terms';
            const read = () =>
                required.evaluate(
                    (control, fieldName) => ({
                        checked: control.getAttribute('aria-checked'),
                        invalid: control.getAttribute('aria-invalid'),
                        describesError:
                            control
                                .getAttribute('aria-describedby')
                                ?.split(/\s+/)
                                .includes(fieldName + '-error') ?? false,
                        submitted: new FormData(control.closest('form')!).getAll(fieldName)
                    }),
                    fieldName
                );
            await expect(required).toHaveAttribute('aria-required', 'true');
            await expect(error).toBeHidden();
            await required.press('Space');
            await next.focus();
            if (grouped) await next.press('Space');
            await expect(error).toBeVisible();
            await expect(required).toHaveAccessibleDescription(grouped ? /Select option a/ : /Accept the terms/);
            const missing = {
                checked: 'false',
                invalid: 'true',
                describesError: true,
                submitted: grouped ? ['b'] : []
            };
            await expect.poll(read).toEqual(missing);
            driver.checkpoints.push({
                name: 'required checkbox reports a Field error after blur',
                state: await read()
            });

            await required.press('Space');
            await expect(error).toBeHidden();
            const valid = {
                checked: 'true',
                invalid: null,
                describesError: false,
                submitted: grouped ? ['a', 'b'] : ['yes']
            };
            await expect.poll(read).toEqual(valid);
            await submit.click();
            await expect(submissions).toHaveText('1');
            driver.checkpoints.push({
                name: 'accepting the required value clears the Field error',
                state: await read()
            });
        }
    })),
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
