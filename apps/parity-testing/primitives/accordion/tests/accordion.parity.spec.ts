import { expect, test } from '@playwright/test';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { cases } from '../src/contract';
import { AccordionDriver } from './driver';

const scenarios = Object.entries(cases).map(([name, settings]) => ({
    name,
    async run(driver: AccordionDriver) {
        const { page } = driver;
        const initial = settings.controlled ? (settings.initial ?? []) : (settings.defaults ?? []);
        await driver.checkpoint('initial', {
            open: ['a', 'b'].map((id) => initial.includes(id)),
            trace: [],
            submits: 0
        });
        if (settings.disabled) {
            await page.getByTestId('before').focus();
            await page.keyboard.press('Tab');
            await expect(page.getByTestId('after')).toBeFocused();
            if (settings.span) {
                await page.getByTestId('a-trigger').focus();
                await page.keyboard.press('Enter');
            } else await page.getByTestId('a-trigger').dispatchEvent('click');
            await driver.checkpoint('disabled request blocked', { trace: [] });
            return;
        }
        if (settings.reveal) {
            await page.getByTestId('a-panel').evaluate((panel) => {
                panel.dispatchEvent(new Event('beforematch', { bubbles: true }));
                panel.removeAttribute('hidden');
            });
        } else if (settings.key) {
            await page.getByTestId('a-trigger').focus();
            await page.keyboard.press(settings.key);
        } else {
            await page.getByTestId('a-trigger').click();
        }
        const refused = settings.controlled || settings.veto;
        const open = refused
            ? ['a', 'b'].map((id) => initial.includes(id))
            : [!initial.includes('a'), settings.multiple ? initial.includes('b') : false];
        await driver.checkpoint('request', {
            open,
            trace: expect.arrayContaining([
                expect.objectContaining({ part: 'a', reason: settings.reveal ? 'none' : 'trigger-press' })
            ])
        });
        if (!refused && !settings.reveal) {
            await page.getByTestId('b-trigger').click();
            await driver.checkpoint('switch sibling', { open: [settings.multiple ? open[0] : false, true] });
        }
    }
}));
const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new AccordionDriver(page, framework),
    readNativeEvents: (driver) => driver.page.evaluate(() => window.accordionParity?.nativeEvents)
});
for (const scenario of scenarios)
    test(scenario.name, async ({ browser, baseURL }, info) => run(scenario, { browser, baseURL }, info));
