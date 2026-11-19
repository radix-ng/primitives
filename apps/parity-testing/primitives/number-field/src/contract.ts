export const cases = {
    'initial-default': { value: undefined, defaultValue: 11 },
    'zero-default': { value: undefined, defaultValue: 0 },
    'initially-empty': { value: undefined, defaultValue: undefined },
    'bound-zero': { value: 0, defaultValue: 11 },
    'bound-null': { value: null, defaultValue: 11 },
    'bound-number': { value: 6, defaultValue: 11 }
} as const;

interface Settings {
    value: number | null | undefined;
    defaultValue?: number;
    format?: Intl.NumberFormatOptions;
    cancelReason?: string;
}

export const blurCases = {
    'blur-empty': { value: null },
    'blur-precision': { value: null },
    'blur-compact-value': { value: 1234.56789, format: { notation: 'compact' } },
    'blur-typed-rounding': { value: null, format: { maximumFractionDigits: 2 } },
    'blur-external-rounding': { value: 1.239, format: { maximumFractionDigits: 2 } },
    'blur-canceled-rounding': { value: 1.239, format: { maximumFractionDigits: 2 }, cancelReason: 'input-blur' },
    'blur-clear': { value: 6 },
    'blur-canceled-clear': { value: 6, cancelReason: 'input-clear' },
    'blur-partial-draft': { value: 6 }
} satisfies Record<string, Settings>;

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

export function config(): Settings {
    const name = new URLSearchParams(location.search).get('case') ?? 'initial-default';
    if (Object.hasOwn(cases, name)) return cases[name as keyof typeof cases];
    if (Object.hasOwn(blurCases, name)) return blurCases[name as keyof typeof blurCases];
    throw new Error('Unknown Number Field case: ' + name);
}

export function installProbe(): Probe {
    const probe: Probe = { reference: __PARITY_REFERENCE__, changes: [], commits: [], nativeEvents: [] };
    window.numberFieldParity = probe;
    return probe;
}
