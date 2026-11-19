type Response = 'ignore' | 'delay' | 'replace' | 'clear' | 'cancel';

interface Settings {
    value?: string | null;
    defaultValue?: string;
    response?: Response;
    label?: boolean;
    nativeButton?: boolean;
}

export const cases = {
    'initial-default': { defaultValue: 'standard' },
    'empty-string-default': { defaultValue: '' },
    'initially-empty': {},
    'bound-value': { value: 'compact', defaultValue: 'standard' },
    'bound-empty-string': { value: '', defaultValue: 'standard' },
    'bound-null': { value: null, defaultValue: 'standard' },
    'controlled-ignore': { value: 'standard', response: 'ignore' },
    'controlled-ignore-null': { value: null, defaultValue: 'standard', response: 'ignore' },
    'controlled-delay': { value: 'standard', response: 'delay' },
    'controlled-replace': { value: 'standard', response: 'replace' },
    'controlled-clear': { value: 'standard', response: 'clear' },
    'controlled-label-ignore': { value: 'standard', response: 'ignore', label: true },
    'controlled-label-cancel': { value: 'standard', response: 'cancel', label: true },
    'editable-label': { defaultValue: 'standard', label: true },
    'native-space': { defaultValue: 'standard', nativeButton: true }
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
    nativeNotifications: { type: string; value: string; checked: boolean }[];
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
    const probe: Probe = {
        reference: __PARITY_REFERENCE__,
        changes: [],
        nativeEvents: [],
        nativeNotifications: [],
        cancelNext: false
    };
    const record = (event: Event) => {
        const input = event.target;
        if (input instanceof HTMLInputElement && input.name === 'density') {
            probe.nativeNotifications.push({ type: event.type, value: input.value, checked: input.checked });
        }
    };
    document.addEventListener('input', record);
    document.addEventListener('change', record);
    window.radioParity = probe;
    return probe;
}
