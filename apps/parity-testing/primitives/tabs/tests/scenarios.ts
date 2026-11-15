import { cases, type CaseName, type Change, type Settings } from '../src/contract';
import type { TabsDriver } from './driver';

const expectedValues = {
    'implicit-zero': 0,
    'implicit-later-zero': 0,
    'implicit-missing-zero': 'one',
    'implicit-disabled-zero': 1,
    'implicit-all-disabled': null,
    'default-number': 1,
    'default-string': 'two',
    'default-disabled': 0,
    'default-null-number': null,
    'default-null-string': null,
    'value-null': null
} satisfies Record<CaseName, string | number | null>;

export const scenarios = (Object.keys(cases) as CaseName[]).map((name) => ({
    name,
    async run(driver: TabsDriver) {
        const settings: Settings = cases[name];
        const value = expectedValues[name];
        const selection = value === null ? [] : [value];
        const changes: Change[] = name.startsWith('implicit-')
            ? [{ value, reason: 'initial', activationDirection: 'none', canceled: settings.cancelAutomatic ?? false }]
            : [];
        await driver.checkpoint('initial selection settled', {
            selected: selection,
            visiblePanels: selection,
            changes
        });
    }
}));
