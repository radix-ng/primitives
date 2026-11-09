export type CaseName =
    | 'single'
    | 'multiple'
    | 'disabled'
    | 'read-only'
    | 'cancel-open'
    | 'cancel-value'
    | 'cancel-close'
    | 'deferred'
    | 'objects'
    | 'array'
    | 'focus-out';
export type ItemValue = string | { id: string; label: string } | number[];
export type Selection = ItemValue | ItemValue[] | null;
export interface Option {
    key: string;
    label: string;
    value: ItemValue;
    disabled?: boolean;
}
export interface FixtureConfig {
    name: CaseName;
    options: Option[];
    initial: Selection;
    multiple: boolean;
    disabled: boolean;
    readOnly: boolean;
    defer: boolean;
    closeOnFocusOut: boolean;
}
export type SelectionKeys = string | string[] | null;
export type TraceEvent =
    | { type: 'open'; open: boolean; reason: string; canceled: boolean; held: boolean }
    | { type: 'value'; value: SelectionKeys; reason: string; canceled: boolean; kinds: string[]; references: boolean }
    | { type: 'complete'; open: boolean };
export interface Reference {
    commit: string;
    packageVersion: string;
    digest: string;
}

declare global {
    const __PARITY_REFERENCE__: Reference;
    interface Window {
        parity: {
            framework: 'angular' | 'react';
            reference: Reference;
            config: FixtureConfig;
            events: TraceEvent[];
            nativeEvents: string[];
            close(): void;
            unmount(): void;
        };
    }
}

export function fixtureConfig(): FixtureConfig {
    const name = new URLSearchParams(location.search).get('case') ?? 'single';
    const names: CaseName[] = [
        'single',
        'multiple',
        'disabled',
        'read-only',
        'cancel-open',
        'cancel-value',
        'cancel-close',
        'deferred',
        'objects',
        'array',
        'focus-out'
    ];
    if (!names.includes(name as CaseName)) throw new Error(`Unknown fixture case: ${name}`);
    let options: Option[] = [
        { key: 'apple', label: 'Apple', value: 'apple' },
        { key: 'banana', label: 'Banana', value: 'banana' },
        { key: 'blueberry', label: 'Blueberry', value: 'blueberry', disabled: true },
        { key: 'cherry', label: 'Cherry', value: 'cherry' }
    ];
    if (name === 'objects')
        options = options.map((option) => ({ ...option, value: { id: option.key, label: option.label } }));
    if (name === 'array')
        options = [
            { key: '10:20', label: '10 × 20', value: [10, 20] },
            { key: '30:40', label: '30 × 40', value: [30, 40] }
        ];
    return {
        name: name as CaseName,
        options,
        initial: name === 'multiple' ? [options[0].value] : options[0].value,
        multiple: name === 'multiple',
        disabled: name === 'disabled',
        readOnly: name === 'read-only',
        defer: name === 'deferred',
        closeOnFocusOut: name === 'focus-out'
    };
}

export function itemKey(value: ItemValue): string {
    return typeof value === 'string' ? value : Array.isArray(value) ? value.join(':') : value.id;
}
export function itemLabel(value: ItemValue): string {
    return typeof value === 'string'
        ? value[0].toUpperCase() + value.slice(1)
        : Array.isArray(value)
          ? value.join(' × ')
          : value.label;
}

/** Only adapts callback signatures / serializable representation. Never commits component state. */
export function installProbe(framework: 'angular' | 'react', config: FixtureConfig) {
    const probe: Window['parity'] = {
        framework,
        config,
        reference: __PARITY_REFERENCE__,
        events: [],
        nativeEvents: [],
        close: () => {
            throw new Error('Root actions not mounted');
        },
        unmount: () => {
            throw new Error('Root actions not mounted');
        }
    };
    window.parity = probe;
    return {
        probe,
        open(open: boolean, reason: string, canceled: boolean, event: Event, held: boolean) {
            probe.events.push({ type: 'open', open, reason, canceled, held });
            probe.nativeEvents.push(event.type);
        },
        value(value: Selection | undefined, reason: string, canceled: boolean, event: Event) {
            const items: ItemValue[] = config.multiple
                ? ((value as ItemValue[]) ?? [])
                : value == null
                  ? []
                  : [value as ItemValue];
            probe.events.push({
                type: 'value',
                value: config.multiple ? items.map(itemKey) : items.length ? itemKey(items[0]) : null,
                reason,
                canceled,
                kinds: items.map((item) => (Array.isArray(item) ? 'array' : typeof item)),
                references: items.every((item) => config.options.some((option) => Object.is(option.value, item)))
            });
            probe.nativeEvents.push(event.type);
        },
        complete(open: boolean) {
            probe.events.push({ type: 'complete', open });
        }
    };
}
