interface Settings {
    value?: string | null;
    defaultValue?: string;
}

export const cases = {
    'initial-default': { defaultValue: 'standard' },
    'empty-string-default': { defaultValue: '' },
    'initially-empty': {},
    'bound-value': { value: 'compact', defaultValue: 'standard' },
    'bound-empty-string': { value: '', defaultValue: 'standard' },
    'bound-null': { value: null, defaultValue: 'standard' }
} satisfies Record<string, Settings>;

export const options = [
    { value: '', label: 'No preference' },
    { value: 'standard', label: 'Standard' },
    { value: 'compact', label: 'Compact' }
] as const;

export interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    changes: { value: string; reason: string }[];
    nativeEvents: { type: string; trusted: boolean }[];
    cancelNext: boolean;
}

declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        radioParity: Probe;
    }
}

export function config(): Settings {
    const name = new URLSearchParams(location.search).get('case') ?? 'initial-default';
    if (!Object.hasOwn(cases, name)) throw new Error('Unknown Radio case: ' + name);
    return cases[name as keyof typeof cases];
}

export function installProbe() {
    const probe: Probe = { reference: __PARITY_REFERENCE__, changes: [], nativeEvents: [], cancelNext: false };
    window.radioParity = probe;
    return probe;
}
