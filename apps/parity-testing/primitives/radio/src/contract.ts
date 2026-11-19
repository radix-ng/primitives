type Response = 'ignore' | 'delay' | 'replace' | 'clear' | 'cancel';

export interface Settings {
    value?: string | null;
    defaultValue?: string;
    response?: Response;
    label?: boolean;
    nativeButton?: boolean;
    keyboard?: 'arrows' | 'disabled-group' | 'cancel' | 'external' | 'space' | 'prevent-space';
    dir?: 'ltr' | 'rtl';
    disabled?: boolean;
    disabledItem?: string;
    readOnly?: boolean;
    forms?: 'external-required' | 'eligible-items' | 'field-labels' | 'field-state' | 'fieldset-legend';
    indicator?: 'unmount' | 'keep-mounted' | 'no-motion';
    collection?: 'identity' | 'live';
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
    'native-space': { defaultValue: 'standard', nativeButton: true },
    'keys-ltr': { keyboard: 'arrows', defaultValue: 'standard' },
    'keys-rtl': { keyboard: 'arrows', dir: 'rtl', defaultValue: 'standard' },
    'keys-empty-disabled-first': { keyboard: 'arrows', disabledItem: '' },
    'keys-skip-disabled': { keyboard: 'arrows', defaultValue: '', disabledItem: 'standard' },
    'keys-checked-disabled': { keyboard: 'arrows', defaultValue: 'standard', disabledItem: 'standard' },
    'keys-disabled-group': { keyboard: 'disabled-group', defaultValue: 'standard', disabled: true },
    'keys-read-only': { keyboard: 'arrows', defaultValue: 'standard', readOnly: true },
    'keys-cancel': { keyboard: 'cancel', defaultValue: 'standard' },
    'keys-controlled-ignore': { keyboard: 'arrows', value: 'standard', response: 'ignore' },
    'keys-external': { keyboard: 'external', value: 'compact', response: 'ignore' },
    'keys-custom-space': { keyboard: 'space', defaultValue: 'standard' },
    'keys-prevent-space': { keyboard: 'prevent-space', defaultValue: 'standard' },
    'forms-external-required': { forms: 'external-required' },
    'forms-eligible-items': { forms: 'eligible-items' },
    'forms-field-labels': { forms: 'field-labels' },
    'forms-field-state': { forms: 'field-state' },
    'forms-fieldset-legend': { forms: 'fieldset-legend' },
    'indicator-unmount': { indicator: 'unmount', defaultValue: 'standard' },
    'indicator-keep-mounted': { indicator: 'keep-mounted', defaultValue: 'standard' },
    'indicator-no-motion': { indicator: 'no-motion', defaultValue: 'standard' },
    'collection-identity': { collection: 'identity' },
    'collection-live': { collection: 'live' }
} satisfies Record<string, Settings>;

export const options = [
    { value: '', label: 'No preference' },
    { value: 'standard', label: 'Standard' },
    { value: 'compact', label: 'Compact' }
] as const;

export const collectionOptions = [
    { id: 'text', value: '1' },
    { id: 'number', value: 1 },
    { id: 'object', value: { value: 7, label: 'Storage' } },
    { id: 'other-object', value: { value: 7, label: 'Storage' } },
    { id: 'array', value: ['a', 'b'] }
];

export type CollectionValue = (typeof collectionOptions)[number]['value'];

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
