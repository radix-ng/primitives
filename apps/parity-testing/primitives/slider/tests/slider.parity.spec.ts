import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import type { Value } from '../src/contract.ts';

const notification = (value: Value, reason: string, eventType: string) => ({ value, reason, eventType });
const change = (value: Value, reason: string, eventType: string, activeThumbIndex = 0) => ({
    ...notification(value, reason, eventType),
    activeThumbIndex,
    target: { name: 'volume', value }
});

class SliderDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['sliderParity']['reference'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get root() {
        return this.page.getByRole('group', { name: 'Volume' });
    }

    get inputs() {
        return this.page.getByRole('slider');
    }

    get control() {
        return this.page.getByTestId('control');
    }

    button(name: string) {
        return this.page.getByRole('button', { name, exact: true });
    }

    async goto(name: string) {
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.root).toHaveCount(1);
        this.metadata = await this.page.evaluate(() => window.sliderParity.reference);
    }

    async state(
        name: string,
        expected: {
            values: number[];
            native?: number[];
            submitted?: string[];
            changes?: ReturnType<typeof change>[];
            commits?: ReturnType<typeof notification>[];
        }
    ) {
        const read = () =>
            this.root.evaluate((root) => {
                const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[type=range]'));
                const form = document.querySelector<HTMLFormElement>('#values')!;
                const { changes, commits } = window.sliderParity;
                return {
                    values: inputs.map((input) => Number(input.getAttribute('aria-valuenow'))),
                    native: inputs.map((input) => input.valueAsNumber),
                    submitted: new FormData(form).getAll('volume'),
                    changes,
                    commits
                };
            });
        const { values, native = values, submitted = native.map(String), changes = [], commits = [] } = expected;
        await expect.poll(read, name).toEqual({ values, native, submitted, changes, commits });
        this.checkpoints.push({ name, state: await read() });
    }

    async position(fraction: number) {
        const box = (await this.control.boundingBox())!;
        return { x: box.x + box.width * fraction, y: box.y + box.height / 2 };
    }

    async startDrag() {
        const thumb = (await this.page.getByTestId('thumb').first().boundingBox())!;
        await this.page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
        await this.page.mouse.down();
        await expect(this.control).toHaveAttribute('data-dragging', '');
        await expect(this.inputs.first()).toBeFocused();
    }

    async dragTo(fraction: number) {
        const point = await this.position(fraction);
        await this.page.mouse.move(point.x, point.y);
    }
}

const scenarios: { name: string; run(driver: SliderDriver): Promise<void> }[] = [
    {
        name: 'controlled',
        async run(driver) {
            const changes = [change(1, 'keyboard', 'keydown')];
            const commits = [notification(1, 'keyboard', 'keydown')];
            await driver.state('bound zero wins over default', { values: [0] });
            await driver.inputs.press('ArrowRight');
            await driver.state('ignored request reports the proposal', { values: [0], changes, commits });
            await driver.inputs.press('ArrowRight');
            changes.push(changes[0]);
            commits.push(commits[0]);
            await driver.state('next request starts from the parent value', { values: [0], changes, commits });
            await driver.button('Apply request').click();
            await driver.state('delayed acceptance', { values: [1], changes, commits });
            await driver.button('Replace value').click();
            await driver.state('parent replaces the value', { values: [35], changes, commits });
        }
    },
    {
        name: 'controlled-drag',
        async run(driver) {
            await driver.startDrag();
            await driver.dragTo(0.75);
            const changes = [change(75, 'drag', 'pointermove')];
            await driver.state('ignored drag uses the parent value', { values: [20], changes });
            await driver.page.mouse.up();
            const commits = [notification(75, 'drag', 'pointerup')];
            await driver.state('release commits the proposed value', { values: [20], changes, commits });
            await driver.button('Apply request').click();
            await driver.state('acceptance after release', { values: [75], changes, commits });
        }
    },
    {
        name: 'controlled-range',
        async run(driver) {
            await driver.startDrag();
            await driver.dragTo(0.75);
            const changes = [change([75, 85], 'drag', 'pointermove')];
            await driver.state('first proposal pushes the second thumb', { values: [20, 60], changes });
            await driver.dragTo(0.55);
            changes.push(change([55, 85], 'drag', 'pointermove'));
            await driver.state('drag continues from the previous proposal', { values: [20, 60], changes });
            await driver.page.mouse.up();
            const commits = [notification([55, 85], 'drag', 'pointerup')];
            await driver.state('commit reports the final range proposal', { values: [20, 60], changes, commits });
            await driver.button('Apply request').click();
            await driver.state('parent accepts both values', { values: [55, 85], changes, commits });
        }
    },
    {
        name: 'one-thumb-array',
        async run(driver) {
            await driver.root.getByText('Volume').click();
            await expect(driver.inputs).toBeFocused();
            await driver.startDrag();
            await driver.dragTo(0.75);
            const changes = [change([75], 'drag', 'pointermove')];
            await driver.page.mouse.up();
            await driver.state('array-shaped gesture and commit', {
                values: [75],
                changes,
                commits: [notification([75], 'drag', 'pointerup')]
            });
        }
    },
    {
        name: 'initial-min',
        async run(driver) {
            await driver.state('initial minimum', { values: [20] });
            await driver.button('Change default').click();
            await driver.button('Lower minimum').click();
            await expect(driver.inputs).toHaveAttribute('min', '10');
            await driver.state('late default and lower minimum preserve the seed', { values: [20] });
            await driver.inputs.press('Home');
            await driver.state('new minimum is available to edits', {
                values: [10],
                changes: [change(10, 'keyboard', 'keydown')],
                commits: [notification(10, 'keyboard', 'keydown')]
            });
        }
    },
    {
        name: 'canceled',
        async run(driver) {
            await driver.page.evaluate(() => {
                window.sliderParity.cancelsChange = true;
            });
            await driver.inputs.press('ArrowRight');
            await driver.state('canceled keyboard proposal', {
                values: [20],
                changes: [change(21, 'keyboard', 'keydown')]
            });
            const point = await driver.position(0.75);
            await driver.page.mouse.click(point.x, point.y);
            await driver.state('canceled track proposal', {
                values: [20],
                changes: [change(21, 'keyboard', 'keydown'), change(75, 'track-press', 'pointerdown')]
            });
        }
    },
    {
        name: 'native-edit',
        async run(driver) {
            const edit = (value: string) =>
                driver.inputs.evaluate((input: HTMLInputElement, value) => {
                    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
                    nativeSetter.call(input, value);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }, value);
            await driver.page.evaluate(() => {
                window.sliderParity.cancelsChange = true;
            });
            await edit('75');
            const changes = [change(75, 'input-change', 'input')];
            await driver.state('veto restores the native value and form submission', { values: [20], changes });
            await driver.page.evaluate(() => {
                window.sliderParity.cancelsChange = false;
            });
            await edit('35');
            changes.push(change(35, 'input-change', 'input'));
            await driver.state('native input and change publish one transaction', {
                values: [35],
                changes,
                commits: [notification(35, 'input-change', 'input')]
            });
        }
    },
    ...(['push', 'swap', 'none'] as const).map((name) => ({
        name,
        async run(driver: SliderDriver) {
            const value = { push: [75, 85], swap: [50, 75], none: [50, 60] }[name];
            const index = name === 'swap' ? 1 : 0;
            await driver.state('initial range', { values: [20, 60] });
            await driver.startDrag();
            await driver.dragTo(0.75);
            const changes = [change(value, 'drag', 'pointermove', index)];
            await driver.state('crossing updates the range', { values: value, changes });
            await expect(driver.inputs.nth(index)).toBeFocused();
            await driver.page.mouse.up();
            await expect(driver.control).not.toHaveAttribute('data-dragging');
            await driver.state('release commits the drag once', {
                values: value,
                changes,
                commits: [notification(value, 'drag', 'pointerup')]
            });
        }
    })),
    ...(['rtl', 'vertical'] as const).map((name) => ({
        name,
        async run(driver: SliderDriver) {
            await expect(driver.inputs).toHaveAttribute('aria-orientation', name === 'rtl' ? 'horizontal' : 'vertical');
            const values = name === 'rtl' ? [21, 11] : [21, 31];
            const keys = name === 'rtl' ? ['ArrowLeft', 'Shift+ArrowRight'] : ['ArrowUp', 'PageUp'];
            const changes: ReturnType<typeof change>[] = [];
            const commits: ReturnType<typeof notification>[] = [];
            for (const [i, key] of keys.entries()) {
                await driver.inputs.press(key);
                changes.push(change(values[i], 'keyboard', 'keydown'));
                commits.push(notification(values[i], 'keyboard', 'keydown'));
                await driver.state(key, { values: [values[i]], changes, commits });
            }
        }
    })),
    {
        name: 'precision',
        async run(driver) {
            await driver.state('fractional initial value', { values: [0.35] });
            await driver.inputs.press('ArrowRight');
            await driver.state('fractional keyboard step', {
                values: [0.45],
                changes: [change(0.45, 'keyboard', 'keydown')],
                commits: [notification(0.45, 'keyboard', 'keydown')]
            });
        }
    },
    {
        name: 'off-grid',
        async run(driver) {
            await driver.state('off-grid authored value', {
                values: [42],
                native: driver.framework === 'angular' ? [42] : [40]
            });
            await driver.inputs.press('ArrowRight');
            await driver.state('keyboard uses the configured step grid', {
                values: [45],
                changes: [change(45, 'keyboard', 'keydown')],
                commits: [notification(45, 'keyboard', 'keydown')]
            });
        }
    },
    {
        name: 'label',
        async run(driver) {
            await expect(driver.page.getByRole('slider', { name: 'Volume' })).toHaveCount(1);
            await driver.root.getByText('Volume').click();
            await expect(driver.inputs).toBeFocused();
            await driver.state('click focuses the associated input', { values: [20] });
        }
    },
    {
        name: 'range-labels',
        async run(driver) {
            const min = driver.page.getByRole('slider', { name: 'Minimum' });
            const max = driver.page.getByRole('slider', { name: 'Maximum' });
            await expect(driver.root.getByText('Volume')).not.toHaveAttribute('for');
            await min.focus();
            const macWebKit =
                driver.page.context().browser()?.browserType().name() === 'webkit' && process.platform === 'darwin';
            await driver.page.keyboard.press(macWebKit ? 'Alt+Tab' : 'Tab');
            await expect(max).toBeFocused();
            await driver.state('each thumb has its own name and focus stop', { values: [20, 60] });
        }
    },
    {
        name: 'reset',
        async run(driver) {
            await driver.state('external form contains both initial values', { values: [20, 60] });
            await driver.inputs.first().press('ArrowRight');
            await driver.button('Change default').click();
            const changes = [change([21, 60], 'keyboard', 'keydown')];
            const commits = [notification([21, 60], 'keyboard', 'keydown')];
            await driver.page.evaluate(() => {
                window.sliderParity.cancelsReset = true;
            });
            await driver.button('Reset').click();
            await driver.state('canceled reset preserves the edit', { values: [21, 60], changes, commits });
            await driver.page.evaluate(() => {
                window.sliderParity.cancelsReset = false;
            });
            await driver.button('Reset').click();
            await driver.state('accepted reset', {
                values: driver.framework === 'angular' ? [20, 60] : [21, 60],
                changes,
                commits
            });
        }
    },
    {
        name: 'disable-drag',
        async run(driver) {
            await driver.startDrag();
            await driver.dragTo(0.4);
            const changes = [change(40, 'drag', 'pointermove')];
            await driver.state('initial move', { values: [40], changes });
            await driver.button('Toggle disabled').evaluate((button: HTMLButtonElement) => button.click());
            await expect(driver.inputs).toBeDisabled();
            await driver.dragTo(0.75);
            await driver.page.mouse.up();
            await driver.state('disabling ends edits and omits the value', { values: [40], submitted: [], changes });
            const dragging = (await driver.control.getAttribute('data-dragging')) !== null;
            if (driver.framework === 'angular') {
                expect(dragging).toBe(false);
                await expect(driver.inputs).not.toBeFocused();
            }
            driver.checkpoints.push({ name: 'drag marker after disable', state: { dragging } });
        }
    },
    {
        name: 'touch',
        async run(driver) {
            const point = await driver.position(0.75);
            await driver.page.touchscreen.tap(point.x, point.y);
            await driver.state('one tap requests and commits once', {
                values: [75],
                changes: [change(75, 'track-press', 'pointerdown')],
                commits: [notification(75, 'track-press', 'pointerup')]
            });
        }
    },
    ...(['edge', 'edge-client-only'] as const).map((name) => ({
        name,
        async run(driver: SliderDriver) {
            const thumb = driver.page.getByTestId('thumb');
            const indicator = driver.page.getByTestId('indicator');
            await driver.inputs.press('Home');
            await expect(thumb).toBeVisible();
            const geometry = async () => {
                const [control, handle, fill] = await Promise.all(
                    [driver.control, thumb, indicator].map((part) => part.boundingBox())
                );
                return {
                    start: Math.round(handle!.x - control!.x),
                    fill: Math.round(fill!.width),
                    end: Math.round(control!.x + control!.width - handle!.x - handle!.width)
                };
            };
            await expect.poll(geometry, 'minimum fits at the start edge').toEqual({ start: 0, fill: 10, end: 180 });
            driver.checkpoints.push({ name: 'minimum geometry', state: await geometry() });
            await driver.inputs.press('End');
            await expect.poll(geometry, 'maximum fits at the end edge').toEqual({ start: 180, fill: 190, end: 0 });
            driver.checkpoints.push({ name: 'maximum geometry', state: await geometry() });
        }
    }))
];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new SliderDriver(page, framework),
    readNativeEvents: (driver) => driver.page.evaluate(() => window.sliderParity?.native ?? []),
    pageOptions: (scenario) => ({ hasTouch: scenario === 'touch' })
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
