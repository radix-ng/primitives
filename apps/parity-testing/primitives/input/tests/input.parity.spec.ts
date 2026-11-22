import { chromium, expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';

class InputDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['inputParity']['reference'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    get input() {
        return this.page.getByRole('textbox', { name: 'Name', exact: true });
    }

    action(name: string) {
        return this.page.getByRole('button', { name, exact: true }).click();
    }

    async goto(name: string) {
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.input).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.inputParity.reference);
    }

    async state(name: string, value: string, requests: string[], submitted: string | null = value) {
        await expect(this.input, name).toHaveValue(value);
        await expect
            .poll(() => this.page.evaluate(() => window.inputParity.requests.map((entry) => entry.value)))
            .toEqual(requests);
        const state = await this.input.evaluate((element: HTMLInputElement) => ({
            value: element.value,
            requests: window.inputParity.requests,
            submitted: element.form ? new FormData(element.form).get('profile-name') : null
        }));
        expect(state.submitted, name).toBe(submitted);
        this.checkpoints.push({ name, state });
    }

    async setFlag(flag: 'cancelEdit' | 'cancelReset' | 'cancelBeforeInput', value: boolean) {
        await this.page.evaluate(([flag, value]) => (window.inputParity[flag] = value), [flag, value] as const);
    }

    async commitReplacement(value: string, composition: boolean) {
        await this.input.evaluate(
            (element: HTMLInputElement, { value, composition }) => {
                // Browser-protocol equivalents below use trusted events. This path exercises
                // the event sequence across all engines without an installed IME or saved profile.
                const inputType = composition ? 'insertCompositionText' : 'insertReplacementText';
                if (composition) element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
                Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value);
                element.dispatchEvent(
                    new InputEvent('input', { bubbles: true, inputType, isComposing: composition, data: value })
                );
                if (composition) {
                    element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: value }));
                }
                element.dispatchEvent(new Event('change', { bubbles: true }));
            },
            { value, composition }
        );
    }
}

const scenarios: { name: string; run(driver: InputDriver): Promise<void> }[] = [
    {
        name: 'default',
        async run(driver) {
            await driver.state('initial default', 'seed', []);
            await driver.action('Change default');
            await driver.state('late update preserves displayed default', 'seed', []);
            await driver.input.fill('edited');
            await driver.state('accepted edit', 'edited', ['edited']);
        }
    },
    {
        name: 'late-default',
        async run(driver) {
            await driver.state('starts empty', '', []);
            await driver.action('Change default');
            await driver.state('first late default', driver.framework === 'angular' ? '' : 'late seed', []);
        }
    },
    {
        name: 'controlled',
        async run(driver) {
            await driver.state('empty controlled value takes precedence', '', []);
            await driver.input.press('a');
            await driver.state('parent can ignore a request', '', ['a']);
            await driver.input.press('b');
            await driver.state('retry starts from the accepted text', '', ['a', 'b']);
            if (driver.framework === 'angular') await expect(driver.input).not.toHaveAttribute('data-editable-value');
            await driver.action('Accept request');
            await driver.state('parent accepts later', 'b', ['a', 'b']);
            await driver.action('Replace value');
            await driver.state('parent replaces accepted value', 'parent', ['a', 'b']);
            await driver.action('Reset profile');
            await driver.state('reset retains controlled value', 'parent', ['a', 'b']);
        }
    },
    {
        name: 'reset',
        async run(driver) {
            await driver.input.fill('edited');
            await driver.input.blur();
            await driver.action('Change default');
            await driver.setFlag('cancelReset', true);
            await driver.action('Reset profile');
            await driver.state('vetoed reset preserves the edit', 'edited', ['edited']);
            await driver.setFlag('cancelReset', false);
            await driver.action('Reset profile');
            await driver.state('accepted native reset', driver.framework === 'angular' ? 'seed' : 'late seed', [
                'edited'
            ]);
            if (driver.framework === 'angular') {
                await expect(driver.input).toHaveAttribute('data-editable-value', 'seed');
                await expect(driver.input).not.toHaveAttribute('data-dirty');
                await expect(driver.input).not.toHaveAttribute('data-touched');
            }
        }
    },
    {
        name: 'canceled',
        async run(driver) {
            await driver.setFlag('cancelEdit', true);
            await driver.input.fill('rejected');
            await driver.state('uncontrolled change veto', driver.framework === 'angular' ? 'seed' : 'rejected', [
                'rejected'
            ]);
            await driver.setFlag('cancelEdit', false);
            await driver.input.fill('accepted');
            await driver.state('retry accepts text', 'accepted', ['rejected', 'accepted']);
        }
    },
    {
        name: 'beforeinput',
        async run(driver) {
            await driver.setFlag('cancelBeforeInput', true);
            await driver.input.press('a');
            await driver.state('canceled beforeinput blocks the edit', '', []);
            expect(await driver.page.evaluate(() => window.inputParity.events)).toEqual(['beforeinput']);
            await driver.setFlag('cancelBeforeInput', false);
            await driver.input.press('b');
            await driver.state('next keystroke edits normally', 'b', ['b']);
        }
    },
    {
        name: 'composition',
        async run(driver) {
            await driver.commitReplacement('日本', true);
            await driver.state('composition input and final change emit once', '日本', ['日本']);
        }
    },
    {
        name: 'replacement',
        async run(driver) {
            await expect(driver.input).toHaveAttribute('autocomplete', 'name');
            await driver.commitReplacement('Ada Lovelace', false);
            await driver.state('replacement input followed by change emits once', 'Ada Lovelace', ['Ada Lovelace']);
        }
    },
    {
        name: 'native-composition',
        async run(driver) {
            const session = await driver.page.context().newCDPSession(driver.page);
            try {
                await driver.input.focus();
                await session.send('Input.imeSetComposition', { text: 'に', selectionStart: 1, selectionEnd: 1 });
                await driver.state('native composition exposes candidate text', 'に', ['に']);
                await session.send('Input.insertText', { text: '日本' });
                await driver.state('native composition commits final text', '日本', ['に', '日本']);
                expect(
                    await driver.page.evaluate(() => window.inputParity.requests.every(({ trusted }) => trusted))
                ).toBe(true);
            } finally {
                await session.detach();
            }
        }
    },
    {
        name: 'autofill',
        async run(driver) {
            const session = await driver.page.context().newCDPSession(driver.page);
            try {
                await session.send('Autofill.enable');
                const { root } = await session.send('DOM.getDocument');
                const { nodeId } = await session.send('DOM.querySelector', {
                    nodeId: root.nodeId,
                    selector: '#profile-input'
                });
                const { node } = await session.send('DOM.describeNode', { nodeId });
                await driver.input.focus();
                await session.send('Autofill.trigger', {
                    fieldId: node.backendNodeId,
                    address: { fields: [{ name: 'NAME_FULL', value: 'Ada Lovelace' }] }
                });
                await driver.state('browser autofill is one accepted native edit', 'Ada Lovelace', ['Ada Lovelace']);
                expect(await driver.page.evaluate(() => window.inputParity.requests[0]?.trusted)).toBe(true);
            } finally {
                await session.detach();
            }
        }
    },
    {
        name: 'locked',
        async run(driver) {
            await expect(driver.input).toHaveAttribute('readonly');
            await driver.input.press('a');
            await driver.state('readonly value is submitted without edits', '', []);
            await driver.action('Toggle disabled');
            await expect(driver.input).toBeDisabled();
            await driver.state('disabled value is excluded from the external form', '', [], null);
        }
    },
    {
        name: 'field',
        async run(driver) {
            await expect(driver.input).toHaveAttribute('name', 'profile-name');
            await expect(driver.input).toHaveAccessibleDescription('Used for your profile.');
            await driver.input.fill('');
            await driver.input.blur();
            await expect(driver.input).toHaveAttribute('data-invalid', '');
            await expect(driver.input).toHaveAttribute('aria-invalid', 'true');
            await expect(driver.input).toHaveAccessibleDescription(/Enter a name\./);
            driver.checkpoints.push({
                name: 'invalid Field attributes',
                state: { ariaInvalid: await driver.input.getAttribute('aria-invalid') }
            });
            await driver.action('Submit profile');
            expect(await driver.page.evaluate(() => window.inputParity.submissions)).toEqual([]);
            await driver.input.fill('not-email');
            await driver.input.press('Enter');
            await expect(driver.input).toHaveAttribute('aria-invalid', 'true');
            await expect(driver.input).toHaveAccessibleDescription(/Enter an email address\./);
            await driver.action('Submit profile');
            expect(await driver.page.evaluate(() => window.inputParity.submissions)).toEqual([]);
            await driver.input.fill('ada@example.com');
            await driver.input.blur();
            await expect(driver.input).not.toHaveAttribute('data-invalid');
            await driver.action('Submit profile');
            expect(await driver.page.evaluate(() => window.inputParity.submissions)).toEqual([
                { 'profile-name': 'ada@example.com' }
            ]);
            await driver.state('valid Field submits under its name', 'ada@example.com', [
                '',
                'not-email',
                'ada@example.com'
            ]);
        }
    }
];

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new InputDriver(page, framework),
    readNativeEvents: ({ page }) => page.evaluate(() => window.inputParity?.events)
});

for (const scenario of scenarios) {
    test(scenario.name, async ({ browser, baseURL, browserName }, info) => {
        test.skip(
            browserName !== 'chromium' && ['native-composition', 'autofill'].includes(scenario.name),
            'Native IME and autofill injection use Chromium DevTools Protocol.'
        );
        // The headless shell does not expose Chromium's Autofill domain.
        const autofillBrowser =
            scenario.name === 'autofill' ? await chromium.launch({ channel: 'chromium' }) : undefined;
        try {
            await run(
                {
                    ...scenario,
                    async run(driver) {
                        await scenario.run(driver);
                        expect(driver.errors).toEqual([]);
                    }
                },
                { browser: autofillBrowser ?? browser, baseURL },
                info
            );
        } finally {
            await autofillBrowser?.close();
        }
    });
}
