export const cases = {
    'initial-default': { value: undefined, defaultValue: 11 },
    'zero-default': { value: undefined, defaultValue: 0 },
    'initially-empty': { value: undefined, defaultValue: undefined },
    'bound-zero': { value: 0, defaultValue: 11 },
    'bound-null': { value: null, defaultValue: 11 },
    'bound-number': { value: 6, defaultValue: 11 }
} as const;

export interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    changes: { value: number | null; reason: string }[];
    commits: (number | null)[];
    nativeEvents: { type: string; trusted: boolean }[];
}

declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        numberFieldParity: Probe;
    }
}

export function config() {
    const name = new URLSearchParams(location.search).get('case') ?? 'initial-default';
    if (!Object.hasOwn(cases, name)) throw new Error('Unknown Number Field case: ' + name);
    return cases[name as keyof typeof cases];
}

export function installProbe(): Probe {
    const probe: Probe = { reference: __PARITY_REFERENCE__, changes: [], commits: [], nativeEvents: [] };
    window.numberFieldParity = probe;
    return probe;
}
