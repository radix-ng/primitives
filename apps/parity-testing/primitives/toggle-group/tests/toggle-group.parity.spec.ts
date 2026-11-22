import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import type { Request } from '../src/contract.ts';

const click = (item: string, value = [item], pressed = true): Request[] => [
    { part: 'item', item, pressed, reason: 'none', eventType: 'click' },
    { part: 'group', value, reason: 'none', eventType: 'click', sharedDetails: true }
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
        await expect(this.group.getByRole('button')).toHaveCount(3);
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

    async focus(name: string, button: string, key: string) {
        const target = this.page.getByRole('button', { name: button, exact: true });
        await this.page.keyboard.press(key);
        await expect(target, name).toBeFocused();
        await expect(target).toHaveAttribute('tabindex', '0');
        const container = this.page.getByRole('toolbar', { name: 'Editing' }).or(this.group);
        const tabStops = container.getByRole('button').and(this.page.locator('[tabindex="0"]'));
        await expect(tabStops).toHaveCount(1);
        const state = await target.evaluate((element) => element.ownerDocument.activeElement?.textContent?.trim());
        this.checkpoints.push({ name, state });
    }

    async focusBefore() {
        await this.page.getByRole('textbox', { name: 'Before' }).focus();
    }

    async cancelAt(part?: 'item' | 'group') {
        await this.page.evaluate((part) => {
            window.toggleGroupParity.cancel = part;
        }, part);
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
    },
    {
        name: 'single',
        async run(driver) {
            await driver.cancelAt('item');
            await driver.item('Bold').click();
            const [item] = click('bold');
            await driver.state('item cancellation stops the entire transaction', [], [item]);

            await driver.cancelAt('group');
            await driver.item('Bold').click();
            const requests = [item, ...click('bold')];
            await driver.state('group cancellation keeps the old selection', [], requests);

            await driver.cancelAt();
            await driver.item('Bold').click();
            requests.push(...click('bold'));
            await driver.state('the accepted request selects Bold', ['Bold'], requests);
            await driver.item('Italic').click();
            requests.push(...click('italic'));
            await driver.state('single selection replaces the previous value', ['Italic'], requests);
            await driver.item('Italic').click();
            requests.push(...click('italic', [], false));
            await driver.state('pressing the selected item clears the array', [], requests);
        }
    },
    {
        name: 'multiple',
        async run(driver) {
            await driver.focusBefore();
            await driver.focus('the first item owns the tab stop', 'Bold', 'Tab');
            const keyboard = driver.page.keyboard;
            await keyboard.down('Space');
            const requests = click('bold');
            await driver.state('native composite Space presses on keydown', ['Bold'], requests);
            await keyboard.up('Space');
            await driver.state('native keyup does not repeat activation', ['Bold'], requests);

            await driver.focus('ArrowRight moves to the custom host', 'Italic', 'ArrowRight');
            await keyboard.down('Space');
            requests.push(...click('italic', ['bold', 'italic']));
            await driver.state('custom Space appends on keydown', ['Bold', 'Italic'], requests);
            await keyboard.up('Space');
            await driver.state('custom keyup does not repeat activation', ['Bold', 'Italic'], requests);

            await driver.focus('ArrowLeft returns to Bold', 'Bold', 'ArrowLeft');
            await keyboard.press('Enter');
            requests.push(...click('bold', ['italic'], false));
            await driver.state('Enter removes only the targeted value', ['Italic'], requests);
        }
    },
    {
        name: 'horizontal',
        async run(driver) {
            await driver.state('Underline is initially selected', ['Underline'], []);
            await expect(driver.item('Italic')).toBeDisabled();
            await driver.focusBefore();
            await driver.focus('Tab starts at the first item', 'Bold', 'Tab');
            await driver.focus('ArrowRight skips the disabled custom item', 'Underline', 'ArrowRight');
            await driver.focus('ArrowRight wraps to the first item', 'Bold', 'ArrowRight');
            await driver.focus('End reaches the last item', 'Underline', 'End');
            await driver.focus('Home goes back to the first item', 'Bold', 'Home');
            await driver.state('focus traversal preserves the selection', ['Underline'], []);
        }
    },
    {
        name: 'vertical',
        async run(driver) {
            await driver.focusBefore();
            await driver.focus('Tab reaches Bold', 'Bold', 'Tab');
            await driver.focus('vertical navigation ignores ArrowRight', 'Bold', 'ArrowRight');
            await driver.focus('ArrowDown reaches Italic', 'Italic', 'ArrowDown');
            await driver.focus('End reaches Underline', 'Underline', 'End');
            await driver.focus('ArrowDown stays at the end with looping off', 'Underline', 'ArrowDown');
            await driver.focus('ArrowUp reaches Italic', 'Italic', 'ArrowUp');
            await driver.focus('Home returns to Bold', 'Bold', 'Home');
            await driver.state('focus traversal makes no press requests', [], []);
        }
    },
    {
        name: 'rtl',
        async run(driver) {
            await driver.focusBefore();
            await driver.focus('Tab reaches Bold in RTL', 'Bold', 'Tab');
            await driver.focus('ArrowLeft advances in RTL', 'Italic', 'ArrowLeft');
            await driver.focus('ArrowRight reverses in RTL', 'Bold', 'ArrowRight');
            await driver.focus('ArrowRight wraps back to Underline', 'Underline', 'ArrowRight');
            await driver.state('RTL traversal makes no press requests', [], []);
        }
    },
    {
        name: 'toolbar',
        async run(driver) {
            await driver.focusBefore();
            await driver.focus('the toolbar shares a tab stop with the group', 'Bold', 'Tab');
            await driver.focus('toolbar skips a disabled group item', 'Underline', 'ArrowRight');
            await driver.focus('toolbar arrows leave the group for Copy', 'Copy', 'ArrowRight');
            await driver.focus('toolbar arrows reenter the group', 'Underline', 'ArrowLeft');
            await driver.page.keyboard.press('Space');
            const requests = click('underline');
            await driver.state('Space still selects through the group', ['Underline'], requests);

            await driver.action('Disable toolbar group');
            await expect(driver.item('Bold')).toBeDisabled();
            await expect(driver.item('Underline')).toBeDisabled();
            await driver.focusBefore();
            await driver.focus('Tab skips a disabled toolbar group', 'Copy', 'Tab');
            await driver.state('disabling the group preserves the selection', ['Underline'], requests);
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
