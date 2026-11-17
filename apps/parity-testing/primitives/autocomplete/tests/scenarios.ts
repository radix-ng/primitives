import { expect } from '@playwright/test';
import { initialCases as cases, type Settings } from '../src/contract';
import type { AutocompleteDriver } from './driver';
import { navigationScenarios } from './navigation.scenarios';
import { readOnlyScenarios } from './read-only.scenarios';
const initialScenarios = (Object.keys(cases) as (keyof typeof cases)[]).map((name) => ({
    name,
    async run(d: AutocompleteDriver) {
        const p: Settings = cases[name];
        const value = p.value ?? p.defaultValue ?? '';
        const open = p.open ?? p.defaultOpen ?? false;
        await d.checkpoint('initial state', value, open, []);
        if (['initial-late-defaults', 'initial-changed-defaults', 'initial-remount-defaults'].includes(name)) {
            await d.page.keyboard.press('F2');
            await expect(d.page.getByTestId('default-value')).toHaveText('Later');
            await expect(d.page.getByTestId('default-open')).toHaveText('true');
            await d.checkpoint('defaults changed after initialization', value, open, []);
            if (name === 'initial-remount-defaults') {
                await d.page.keyboard.press('F5');
                await expect(d.page.getByTestId('input')).toHaveCount(0);
                await d.page.keyboard.press('F6');
                await d.checkpoint('fresh root reads fresh defaults', 'Later', true, []);
            }
        }
        if (name === 'initial-clear-then-defaults') {
            await d.page.getByTestId('clear').click();
            await d.checkpoint('user cleared default', '', true, [{ kind: 'value', value: '', canceled: false }]);
            await d.page.keyboard.press('F2');
            await expect(d.page.getByTestId('default-value')).toHaveText('Later');
            await d.checkpoint('late default does not refill cleared input', '', true, [
                { kind: 'value', value: '', canceled: false }
            ]);
        }
        if (name === 'initial-close-then-defaults') {
            await d.page.getByTestId('input').press('Escape');
            const requests = [{ kind: 'open' as const, value: false, canceled: false }];
            await d.checkpoint('user closed initial popup', value, false, requests);
            await d.page.keyboard.press('F2');
            await expect(d.page.getByTestId('default-open')).toHaveText('false');
            await d.page.keyboard.press('F2');
            await expect(d.page.getByTestId('default-open')).toHaveText('true');
            await d.checkpoint('late default does not reopen popup', value, false, requests);
        }
        if (name === 'initial-external-updates') {
            await d.page.keyboard.press('F3');
            await d.checkpoint('external values update', 'External', true, []);
            await d.page.keyboard.press('F4');
            await d.checkpoint('external falsy values update', '', false, []);
            await d.page.keyboard.press('F2');
            await expect(d.page.getByTestId('default-value')).toHaveText('Later');
            await d.checkpoint('defaults do not replace external values', '', false, []);
        }
    }
}));

export const scenarios = [...initialScenarios, ...navigationScenarios, ...readOnlyScenarios];
