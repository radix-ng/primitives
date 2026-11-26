import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import type { Orientation } from '../src/contract.ts';

class SeparatorDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['separatorParity'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    async goto(): Promise<void> {
        await this.page.goto('/' + this.framework + '.html');
        await expect(this.page.getByRole('button', { name: 'Set vertical', exact: true })).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.separatorParity);
    }

    async click(name: string): Promise<void> {
        await this.page.getByRole('button', { name, exact: true }).click();
    }

    async record(name: string, part: string, orientation: Orientation, tag = 'div'): Promise<void> {
        const separator = this.page.getByRole('separator').and(this.page.locator(`[data-part="${part}"]`));
        const read = () =>
            separator.evaluate((element: HTMLElement) => ({
                tag: element.localName,
                role: element.getAttribute('role'),
                ariaOrientation: element.getAttribute('aria-orientation'),
                dataOrientation: element.getAttribute('data-orientation'),
                tabIndex: element.tabIndex
            }));
        await expect.poll(read, name).toEqual({
            tag,
            role: 'separator',
            ariaOrientation: orientation,
            dataOrientation: orientation,
            tabIndex: -1
        });
        this.checkpoints.push({ name, state: await read() });
    }
}

const scenarios = [
    {
        name: 'default-and-tab-order',
        async run(driver: SeparatorDriver) {
            await driver.record('omitted orientation', 'default', 'horizontal');
            await driver.page.getByRole('textbox', { name: 'Before separator' }).focus();
            await driver.page.keyboard.press('Tab');
            const after = driver.page.getByRole('textbox', { name: 'After separator' });
            await expect(after).toBeFocused();
            driver.checkpoints.push({
                name: 'Tab skips separator',
                state: { focused: await after.getAttribute('aria-label') }
            });
        }
    },
    {
        name: 'reactive-orientation',
        async run(driver: SeparatorDriver) {
            await driver.record('initial undefined orientation', 'reactive', 'horizontal');
            await driver.click('Set vertical');
            await driver.record('vertical update', 'reactive', 'vertical');
            await driver.click('Set horizontal');
            await driver.record('horizontal update', 'reactive', 'horizontal');
            await driver.click('Set vertical');
            await driver.record('vertical before clear', 'reactive', 'vertical');
            await driver.click('Clear orientation');
            await driver.record('cleared orientation', 'reactive', 'horizontal');
        }
    },
    {
        name: 'native-host',
        async run(driver: SeparatorDriver) {
            await driver.record('native hr with vertical orientation', 'native', 'vertical', 'hr');
        }
    },
    {
        name: 'toolbar-composition',
        async run(driver: SeparatorDriver) {
            await driver.record('horizontal toolbar fallback', 'toolbar-derived', 'vertical');
            await driver.record('initial explicit undefined', 'toolbar-initial-undefined', 'horizontal');
            await driver.record('explicit toolbar orientation', 'toolbar-override', 'horizontal');
            await driver.click('Rotate toolbar');
            await driver.record('vertical toolbar fallback', 'toolbar-derived', 'horizontal');
            await driver.click('Rotate toolbar');
            await driver.record('reactive toolbar fallback', 'toolbar-derived', 'vertical');
            await driver.record('explicit toolbar orientation survives rotation', 'toolbar-override', 'horizontal');
            await driver.click('Clear toolbar override');
            await expect(driver.page.getByRole('toolbar', { name: 'Editing' })).toHaveAttribute(
                'data-override',
                'unset'
            );
            await driver.record('cleared toolbar orientation', 'toolbar-override', 'horizontal');
        }
    }
];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new SeparatorDriver(page, framework),
    readNativeEvents: (driver) => {
        expect(driver.errors).toEqual([]);
        return Promise.resolve([]);
    }
});

for (const scenario of scenarios) {
    test(scenario.name, ({ browser, baseURL }, info) => run(scenario, { browser, baseURL }, info));
}
