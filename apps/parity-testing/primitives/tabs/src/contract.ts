export type Value = string | number | null;
export interface Option {
    value: string | number;
    label: string;
    disabled?: boolean;
}
export interface Settings {
    options: Option[];
    defaultValue?: Value;
    value?: Value;
    cancelAutomatic?: boolean;
}

const numericOptions: Option[] = [
    { value: 0, label: 'Zero' },
    { value: 1, label: 'One' },
    { value: 2, label: 'Two' }
];
const stringOptions: Option[] = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three' }
];
export const cases = {
    'implicit-zero': { options: numericOptions },
    'implicit-later-zero': { options: [numericOptions[1], numericOptions[0], numericOptions[2]] },
    'implicit-missing-zero': { options: stringOptions },
    'implicit-disabled-zero': {
        options: numericOptions.map((option) => ({ ...option, disabled: option.value === 0 })),
        cancelAutomatic: true
    },
    'implicit-all-disabled': {
        options: numericOptions.map((option) => ({ ...option, disabled: true })),
        cancelAutomatic: true
    },
    'default-number': { options: numericOptions, defaultValue: 1 },
    'default-string': { options: stringOptions, defaultValue: 'two' },
    'default-disabled': {
        options: numericOptions.map((option) => ({ ...option, disabled: option.value === 0 })),
        defaultValue: 0
    },
    'default-null-number': { options: numericOptions, defaultValue: null },
    'default-null-string': { options: stringOptions, defaultValue: null },
    'value-null': { options: numericOptions, defaultValue: 1, value: null }
} satisfies Record<string, Settings>;
export type CaseName = keyof typeof cases;

export interface Change {
    value: Value;
    reason: string;
    activationDirection: string;
    canceled: boolean;
}
export interface Probe {
    framework: 'angular' | 'react';
    reference: { commit: string; packageVersion: string; digest: string };
    config: Settings;
    changes: Change[];
    nativeEvents: { type: string; trusted: boolean; trigger: string | null }[];
}
declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        tabsParity: Probe;
    }
}

export function config(): Settings {
    const name = new URLSearchParams(location.search).get('case') ?? 'implicit-zero';
    if (!Object.hasOwn(cases, name)) throw new Error(`Unknown Tabs case: ${name}`);
    return cases[name as CaseName];
}

export function installProbe(framework: Probe['framework'], settings: Settings) {
    const probe: Probe = {
        framework,
        reference: __PARITY_REFERENCE__,
        config: settings,
        changes: [],
        nativeEvents: []
    };
    window.tabsParity = probe;
    return {
        probe,
        change(
            value: Value,
            reason: string,
            activationDirection: string,
            canceled: boolean,
            event: Event,
            trigger?: Element
        ) {
            probe.changes.push({ value, reason, activationDirection, canceled });
            probe.nativeEvents.push({ type: event.type, trusted: event.isTrusted, trigger: trigger?.id ?? null });
        }
    };
}

export const classes = {
    root: 'grid w-80 gap-3',
    list: 'flex gap-2',
    tab: 'border-border rounded border px-3 py-2 data-active:bg-primary data-active:text-primary-foreground',
    panel: 'border-border rounded border p-4'
};
