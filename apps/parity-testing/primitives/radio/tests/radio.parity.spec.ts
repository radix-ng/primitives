import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { cases, options, type Probe, type Settings } from '../src/contract';

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
        return this.page.getByRole('radiogroup', { name: 'Density' });
    }

    async goto(name: string) {
        this.settings = cases[name as keyof typeof cases];
        this.nativeButton = this.settings.nativeButton ?? false;
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.group.getByRole('radio')).toHaveCount(options.length);
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

const scenarios = Object.entries(cases).map(([name, settings]) => ({
    name,
    async run(driver: RadioDriver) {
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
