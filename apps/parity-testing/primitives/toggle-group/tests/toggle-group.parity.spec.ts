import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import type { Request } from '../src/contract.ts';

const click = (item: string): Request[] => [
    { part: 'item', item, pressed: true, reason: 'none', eventType: 'click' },
    { part: 'group', value: [item], reason: 'none', eventType: 'click', sharedDetails: true }
];

class ToggleGroupDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['toggleGroupParity']['reference'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get group() {
        return this.page.getByRole('group', { name: 'Formatting' });
    }

    item(name: string) {
        return this.group.getByRole('button', { name });
    }

    action(name: string) {
        return this.page.getByRole('button', { name, exact: true }).click();
    }

    async goto(name: string) {
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.group.getByRole('button')).toHaveCount(2);
        this.metadata = await this.page.evaluate(() => window.toggleGroupParity.reference);
    }

    async state(name: string, pressed: string[], requests: Request[]) {
        const read = () =>
            this.group.evaluate((group) => ({
                pressed: [...group.querySelectorAll('[aria-pressed="true"]')].map((item) => item.textContent?.trim()),
                styled: [...group.querySelectorAll('[data-pressed]')].map((item) => item.textContent?.trim()),
                requests: window.toggleGroupParity.requests
            }));
        await expect.poll(read, name).toEqual({ pressed, styled: pressed, requests });
        this.checkpoints.push({ name, state: await read() });
    }
}

const scenarios: { name: string; run(driver: ToggleGroupDriver): Promise<void> }[] = [
    {
        name: 'default',
        async run(driver) {
            await driver.state('initial default is selected', ['Bold'], []);
            await driver.action('Change default');
            await driver.state('late default leaves the selection intact', ['Bold'], []);
            await driver.item('Italic').click();
            await driver.state('accepted selection replaces the default', ['Italic'], click('italic'));
        }
    },
    {
        name: 'late-default',
        async run(driver) {
            await driver.state('omitted default starts empty', [], []);
            await driver.action('Change default');
            await driver.state('first late default leaves the group empty', [], []);
        }
    },
    {
        name: 'controlled',
        async run(driver) {
            await driver.state('explicit empty selection wins over the default', [], []);
            await driver.item('Bold').click();
            await driver.state('ignored request leaves the selection empty', [], click('bold'));
            await driver.item('Bold').click();
            const requests = [...click('bold'), ...click('bold')];
            await driver.state('repeat uses the effective empty array', [], requests);
            await driver.action('Apply request');
            await driver.state('parent accepts the selection later', ['Bold'], requests);
            await driver.action('Clear selection');
            await driver.state('parent replaces the accepted selection', [], requests);
        }
    }
];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new ToggleGroupDriver(page, framework),
    readNativeEvents: () => Promise.resolve([])
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
