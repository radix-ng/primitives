import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { cases, collectionOptions, options, type Probe, type Settings } from '../src/contract';

class RadioDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Probe['reference'];
    private nativeButton = false;
    private settings: Settings = {};

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get group() {
        if (this.settings.collection) return this.page.getByRole('radiogroup', { name: 'Primary' });
        return this.page.getByRole('radiogroup');
    }

    async goto(name: string) {
        this.settings = cases[name as keyof typeof cases];
        this.nativeButton = this.settings.nativeButton ?? false;
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        const count = this.settings.collection ? collectionOptions.length : this.settings.forms ? 2 : options.length;
        await expect(this.group.getByRole('radio')).toHaveCount(count);
        this.metadata = await this.page.evaluate(() => window.radioParity.reference);
    }

    async checkpoint(name: string, value: string | null, changes: string[] = []) {
        const read = () =>
            this.group.evaluate(
                (group, skipNativeInputs) => ({
                    items: Array.from(group.querySelectorAll('[role=radio]'), (item) => ({
                        checked: item.getAttribute('aria-checked'),
                        dataChecked: item.hasAttribute('data-checked'),
                        dataUnchecked: item.hasAttribute('data-unchecked')
                    })),
                    inputs: skipNativeInputs
                        ? []
                        : Array.from(group.querySelectorAll<HTMLInputElement>('input[type=radio]'), (input) => ({
                              checked: input.checked,
                              value: input.value
                          })),
                    submitted: new FormData(group.closest('form')!).getAll('density'),
                    changes: window.radioParity.changes
                }),
                this.nativeButton
            );
        await expect.poll(read).toEqual({
            items: options.map((option) => ({
                checked: String(option.value === value),
                dataChecked: option.value === value,
                dataUnchecked: option.value !== value
            })),
            inputs: this.nativeButton
                ? []
                : options.map((option) => ({ checked: option.value === value, value: option.value })),
            submitted: value === null || this.settings.disabled || this.settings.disabledItem === value ? [] : [value],
            changes: changes.map((next) => ({ value: next, reason: 'none' }))
        });
        this.checkpoints.push({ name, state: await read() });
        this.measurements.push({
            name,
            notifications: await this.page.evaluate(() => window.radioParity.nativeNotifications)
        });
        expect(this.errors).toEqual([]);
    }

    async focusCheckpoint(name: string, focus: string, tabStop: string | null) {
        const read = () =>
            this.group.evaluate((group) => ({
                focus: document.activeElement?.getAttribute('data-testid'),
                tabStops: Array.from(group.querySelectorAll<HTMLElement>('[role=radio]'))
                    .filter((item) => item.tabIndex === 0)
                    .map((item) => item.dataset['testid'])
            }));
        await expect.poll(read, name).toEqual({ focus, tabStops: tabStop === null ? [] : [tabStop] });
        this.checkpoints.push({ name, state: await read() });
    }
}

async function collectionScenario(driver: RadioDriver, mode: NonNullable<Settings['collection']>) {
    const { page, group } = driver;
    const read = () =>
        group.evaluate((root) => ({
            order: [...root.querySelectorAll<HTMLElement>('[role="radio"]')].map((item) => item.dataset.testid),
            checked: [...root.querySelectorAll<HTMLElement>('[aria-checked="true"]')].map(
                (item) => item.dataset.testid
            ),
            submitted: new FormData(root.closest('form')!).getAll('choice'),
            separateForm: new FormData(document.querySelector<HTMLFormElement>('#secondary')!).getAll('choice'),
            requests: Number(root.closest('form')?.querySelector('output')?.textContent)
        }));
    let order = collectionOptions.map(({ id }) => id);
    const checkpoint = async (name: string, checked: string | null, submitted: string[], requests: number) => {
        await expect.poll(read, name).toEqual({
            order,
            checked: checked === null ? [] : [checked],
            submitted,
            separateForm: ['1'],
            requests
        });
        driver.checkpoints.push({ name, state: await read() });
        expect(driver.errors).toEqual([]);
    };
    await checkpoint('string selected initially', 'text', ['1'], 0);
    const number = group.getByTestId('number');
    await number.click();
    await checkpoint('number and string serialize the same but have distinct identities', 'number', ['1'], 1);

    if (mode === 'identity') {
        const serialized = JSON.stringify(collectionOptions[2].value);
        await group.getByTestId('object').click();
        await checkpoint('object serializes without losing its wrapper', 'object', [serialized], 2);
        await group.getByTestId('other-object').click();
        await checkpoint('equal object content does not select two items', 'other-object', [serialized], 3);
        await group.getByTestId('array').click();
        await checkpoint('array-valued item submits one entry', 'array', ['["a","b"]'], 4);
        return;
    }

    await number.evaluate((element) => element.setAttribute('data-original', ''));
    await number.focus();
    await page
        .getByRole('button', { name: 'Reverse options' })
        .evaluate((element: HTMLButtonElement) => element.click());
    order = [...order].reverse();
    await checkpoint('tracked move keeps selection and serialization', 'number', ['1'], 1);
    await expect(number).toHaveAttribute('data-original', '');
    await expect(number).toBeFocused();

    const mutate = page.getByRole('button', { name: 'Change number value' });
    await mutate.evaluate((element: HTMLButtonElement) => element.click());
    await checkpoint('changing an item value leaves the current selection orphaned', null, [], 1);
    await expect(number).toHaveAttribute('data-original', '');
    await mutate.evaluate((element: HTMLButtonElement) => element.click());
    await checkpoint('restoring the item value restores the selection', 'number', ['1'], 1);

    await number.press('ArrowDown');
    await expect(group.getByTestId('text')).toBeFocused();
    await checkpoint('arrows follow the reordered DOM', 'text', ['1'], 2);
}

async function formsScenario(driver: RadioDriver, mode: NonNullable<Settings['forms']>) {
    const { page, group } = driver;
    const form = page.locator('form#owner');
    const alpha = page.getByTestId('radio-a');
    const beta = page.getByTestId('radio-b');
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    const toggleDisabled = page.getByRole('button', { name: 'Toggle disabled' });
    const submitted = (name: string, entries: string[]) =>
        checkpoint(
            name,
            () =>
                form.evaluate((element: HTMLFormElement) =>
                    Array.from(new FormData(element), ([key, value]) => [key, String(value)])
                ),
            entries.map((entry) => ['density', entry])
        );
    async function checkpoint<T>(name: string, read: () => Promise<T>, expected: T) {
        await expect.poll(read, name).toEqual(expected);
        driver.checkpoints.push({ name, state: { value: await read() } });
        expect(driver.errors).toEqual([]);
    }

    if (mode === 'external-required') {
        await checkpoint(
            'empty external required group is invalid',
            () => form.evaluate((element: HTMLFormElement) => element.checkValidity()),
            false
        );
        await submit.click();
        await expect(form).not.toHaveAttribute('data-submitted');
        await checkpoint(
            'invalid input redirects focus to the visible item',
            () => page.evaluate(() => document.activeElement?.getAttribute('data-testid')),
            'radio-a'
        );
        await beta.click();
        await submitted('selected radio belongs to the external form', ['b']);
        await submit.click();
        await expect(form).toHaveAttribute('data-submitted', 'true');
        return;
    }

    if (mode === 'eligible-items') {
        await submitted('the enabled selected radio submits one entry', ['a']);
        await toggleDisabled.click();
        await expect(alpha).toHaveAttribute('aria-checked', 'true');
        await submitted('a disabled selection is omitted', []);
        await toggleDisabled.click();
        await submitted('re-enabling restores submission', ['a']);
        const toggleAlpha = page.getByRole('button', { name: 'Toggle Alpha' });
        await toggleAlpha.click();
        await expect(alpha).toHaveCount(0);
        await submitted('an unmounted selection is omitted', []);
        await toggleAlpha.click();
        await submitted('remounting restores a still selected value', ['a']);
        return;
    }

    await expect(group).toHaveAccessibleName('Density');
    await expect(group).toHaveAccessibleDescription('Pick a density');
    await expect(alpha).toHaveAccessibleName('Alpha');
    await expect(beta).toHaveAccessibleName('Beta');
    const label = page.getByTestId('label-b');
    await checkpoint(
        'item label owns its radio input',
        () => label.evaluate((node: HTMLLabelElement) => node.control?.getAttribute('value')),
        'b'
    );
    await checkpoint(
        'item description contains group and local text',
        () =>
            beta.evaluate((node) =>
                node
                    .getAttribute('aria-describedby')
                    ?.split(/\s+/)
                    .filter((id) => ['description-b', 'group-description'].includes(id))
                    .sort()
            ),
        ['description-b', 'group-description']
    );

    if (mode === 'field-labels') {
        await label.click();
        await expect(beta).toHaveAttribute('aria-checked', 'true');
        await submitted('Field name takes precedence on label activation', ['b']);
        return;
    }

    const parts = [page.getByTestId('field'), group, beta, page.getByTestId('indicator-b')];
    const state = () =>
        Promise.all(
            parts.map((part) =>
                part.evaluate((node) =>
                    ['focused', 'filled', 'dirty', 'touched'].filter((attr) => node.hasAttribute('data-' + attr))
                )
            )
        );
    const fieldFlags = (name: string, flags: string[]) =>
        checkpoint(
            name,
            state,
            parts.map(() => flags)
        );
    await fieldFlags('initial Field flags', []);
    await alpha.focus();
    await fieldFlags('focus marks the Field without choosing a value', ['focused']);
    await page.keyboard.press('ArrowDown');
    await expect(beta).toBeFocused();
    await fieldFlags('an accepted edit fills and touches the Field', ['focused', 'filled', 'dirty', 'touched']);
    await submitted('the accepted edit is serialized', ['b']);
    await page.getByRole('button', { name: 'Toggle Beta' }).evaluate((button: HTMLButtonElement) => button.click());
    await expect(beta).toHaveAttribute('aria-disabled', 'true');
    await expect(alpha).not.toHaveAttribute('aria-disabled', 'true');
    await fieldFlags('disabling a focused item clears Field focus', ['filled', 'dirty', 'touched']);
    await submitted('Field.Item disabled excludes its selection', []);
    await toggleDisabled.evaluate((button: HTMLButtonElement) => button.click());
    await expect(group).toHaveAttribute('aria-disabled', 'true');
    await expect(alpha).toHaveAttribute('aria-disabled', 'true');
}

async function keyboardScenario(driver: RadioDriver, settings: Settings) {
    const { page } = driver;
    const macWebKit = page.context().browser()?.browserType().name() === 'webkit' && process.platform === 'darwin';
    const tab = macWebKit ? 'Alt+Tab' : 'Tab';
    const reverseTab = macWebKit ? 'Alt+Shift+Tab' : 'Shift+Tab';
    let selected = settings.value ?? settings.defaultValue ?? null;
    const enabled = options.map((option) => option.value).filter((value) => value !== settings.disabledItem);
    let active: string = selected ?? enabled[0];
    const id = (value: string) => 'radio-' + value;
    const requests: string[] = [];
    await driver.checkpoint('initial keyboard selection', selected);
    await page.getByTestId('before').focus();

    if (settings.keyboard === 'disabled-group') {
        await page.keyboard.press(tab);
        await driver.focusCheckpoint('disabled group leaves the tab order', 'after', null);
        return;
    }

    if (settings.keyboard === 'external') {
        await page.getByRole('button', { name: 'Write value' }).click();
        selected = 'standard';
        await driver.checkpoint('external selection does not request a change', selected);
        await page.getByTestId('before').focus();
    }

    await page.keyboard.press(tab);
    await driver.focusCheckpoint('Tab enters the roving stop', id(active), id(active));
    await driver.checkpoint('Tab does not select', selected);

    if (settings.keyboard === 'space' || settings.keyboard === 'prevent-space') {
        await page.getByTestId(id('compact')).focus();
        await page.keyboard.press('Enter');
        await driver.checkpoint('Enter does not select a custom host', selected);
        await page.keyboard.down('Space');
        await page.keyboard.down('Space');
        await driver.checkpoint('custom Space waits for release', selected);
        await page.keyboard.up('Space');
        if (settings.keyboard === 'space') {
            selected = 'compact';
            requests.push(selected);
        }
        await driver.checkpoint('custom Space release respects prevention', selected, requests);
        return;
    }

    for (const key of ['Home', 'End', 'Control+ArrowDown']) {
        await page.keyboard.press(key);
        await driver.focusCheckpoint(key + ' leaves the roving stop', id(active), id(active));
    }

    const move = async (key: string, delta: number, veto = false) => {
        const all = options.map((option) => option.value);
        const start = all.indexOf(active as (typeof options)[number]['value']);
        for (let step = 1; step <= all.length; step++) {
            const next = all[(start + all.length + delta * step) % all.length];
            if (enabled.includes(next)) {
                active = next;
                break;
            }
        }
        if (veto)
            await page.evaluate(() => {
                window.radioParity.cancelNext = true;
            });
        await page.keyboard.press(key);
        if (!settings.readOnly && active !== selected) {
            requests.push(active);
            if (!veto && settings.response !== 'ignore') selected = active;
        }
        await driver.focusCheckpoint(key + ' moves focus', id(active), id(active));
        await driver.checkpoint(key + ' selection', selected, requests);
    };

    await move(settings.dir === 'rtl' ? 'Shift+ArrowLeft' : 'Shift+ArrowRight', 1, settings.keyboard === 'cancel');
    await move('ArrowDown', 1);
    await move('ArrowUp', -1);
    await page.keyboard.press(tab);
    await driver.focusCheckpoint('Tab leaves the group', 'after', id(active));
    await page.keyboard.press(reverseTab);
    await driver.focusCheckpoint('Shift+Tab resumes at last focus', id(active), id(active));
    await driver.checkpoint('re-entry preserves selection', selected, requests);
}

async function indicatorScenario(driver: RadioDriver, mode: NonNullable<Settings['indicator']>) {
    const { page, group } = driver;
    const standard = page.getByTestId('radio-standard');
    const compact = page.getByTestId('radio-compact');
    const original = page.getByTestId('indicator-standard');
    const next = page.getByTestId('indicator-compact');
    const retained = mode === 'keep-mounted';
    const animated = mode !== 'no-motion';

    await page.addStyleTag({
        content: `
            [data-testid^="indicator-"] { display: inline-block; width: 10px; height: 10px; }
            ${
                animated
                    ? `
                [data-testid^="indicator-"][data-ending-style] { animation: indicator-exit 1s linear both paused; }
                @keyframes indicator-exit { to { opacity: 0; } }
            `
                    : ''
            }
        `
    });
    await group.evaluate((root) => {
        const recordEnter = () => {
            for (const indicator of root.querySelectorAll<HTMLElement>('[data-starting-style]')) {
                if (indicator.dataset['testid']?.startsWith('indicator-')) indicator.dataset['entered'] = 'true';
            }
        };
        new MutationObserver(recordEnter).observe(root, {
            childList: true,
            subtree: true,
            attributeFilter: ['data-starting-style']
        });
    });

    const settled = async (indicator: typeof original, state: 'checked' | 'unchecked') => {
        await expect(indicator).toBeVisible();
        await expect(indicator).toHaveAttribute('data-' + state, '');
        await expect(indicator).not.toHaveAttribute('data-starting-style');
        await expect(indicator).not.toHaveAttribute('data-ending-style');
    };
    const inactive = async (indicator: typeof original) => {
        if (retained) await settled(indicator, 'unchecked');
        else await expect(indicator).toHaveCount(0);
    };

    await settled(original, 'checked');
    await expect(original).not.toHaveAttribute('data-entered');
    await inactive(next);
    await original.evaluate((node) => node.setAttribute('data-original', ''));
    await driver.checkpoint('initial indicators are settled', 'standard');

    await compact.click();
    await expect(next).toHaveAttribute('data-entered', 'true');
    await settled(next, 'checked');
    if (animated) {
        const pendingExit = async () => {
            await expect(original).toBeVisible();
            await expect(original).toHaveAttribute('data-unchecked', '');
            await expect(original).toHaveAttribute('data-ending-style', '');
            await expect
                .poll(() => original.evaluate((node) => node.getAnimations().map((animation) => animation.playState)))
                .toEqual(['paused']);
        };
        await pendingExit();
        await driver.checkpoint('outgoing indicator stays mounted during exit', 'compact', ['compact']);

        await standard.click();
        await settled(original, 'checked');
        await expect(original).toHaveAttribute('data-original', '');
        await expect(original).not.toHaveAttribute('data-entered');
        await driver.checkpoint('reopening reuses the outgoing indicator', 'standard', ['compact', 'standard']);

        await compact.click();
        await pendingExit();
        await original.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
    }
    await inactive(original);
    const edits = animated ? ['compact', 'standard', 'compact'] : ['compact'];
    await driver.checkpoint('settled inactive indicator follows keepMounted', 'compact', edits);

    await standard.click();
    await settled(original, 'checked');
    await expect(original).toHaveAttribute('data-entered', 'true');
    if (retained) await expect(original).toHaveAttribute('data-original', '');
    else await expect(original).not.toHaveAttribute('data-original');
    await driver.checkpoint('reselection after exit', 'standard', [...edits, 'standard']);
}

const scenarios = Object.entries(cases).map(([name, settings]) => ({
    name,
    async run(driver: RadioDriver) {
        if ('forms' in settings) return formsScenario(driver, settings.forms);
        if ('indicator' in settings) return indicatorScenario(driver, settings.indicator);
        if ('collection' in settings) return collectionScenario(driver, settings.collection);
        if ('keyboard' in settings) return keyboardScenario(driver, settings);
        if ('response' in settings) {
            await driver.checkpoint('parent value owns the group', settings.value);
            const compact =
                'label' in settings
                    ? driver.page.getByTestId('label-compact')
                    : driver.group.getByRole('radio', { name: 'Compact' });
            await compact.click();

            if (settings.response === 'replace') {
                await driver.checkpoint('parent replacement commits', '', ['compact']);
            } else if (settings.response === 'clear') {
                await driver.checkpoint('parent clears selection', null, ['compact']);
            } else {
                await driver.checkpoint('request leaves parent selection intact', settings.value, ['compact']);
                if (settings.response === 'delay') {
                    await driver.page.getByRole('button', { name: 'Apply request' }).click();
                    await driver.checkpoint('later parent acceptance commits', 'compact', ['compact']);
                } else {
                    await compact.click();
                    await driver.checkpoint('repeated request leaves selection intact', settings.value, [
                        'compact',
                        'compact'
                    ]);
                }
            }
            if (driver.framework === 'angular') {
                expect(await driver.page.evaluate(() => window.radioParity.nativeNotifications)).toEqual([]);
            }
            return;
        }
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
        const item =
            'label' in settings
                ? driver.page.getByTestId('label-' + edited)
                : driver.group.getByRole('radio', { name: edited === 'compact' ? 'Compact' : 'Standard' });
        await driver.page.evaluate(() => {
            window.radioParity.cancelNext = true;
        });
        if ('nativeButton' in settings) {
            await item.focus();
            await driver.page.keyboard.down('Space');
            await driver.checkpoint('native Space waits for release', selected);
            await driver.page.keyboard.up('Space');
        } else {
            await item.click();
        }
        await driver.checkpoint('veto keeps selection and serialization', selected, [edited]);
        if ('nativeButton' in settings) await item.press('Space');
        else await item.click();
        await driver.checkpoint('accepted click updates selection once', edited, [edited, edited]);
        if (driver.framework === 'angular' && !('nativeButton' in settings)) {
            expect(await driver.page.evaluate(() => window.radioParity.nativeNotifications)).toEqual([
                { type: 'input', value: edited, checked: true },
                { type: 'change', value: edited, checked: true }
            ]);
        }
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
