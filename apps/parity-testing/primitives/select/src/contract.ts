export type CaseName =
    | 'single'
    | 'multiple'
    | 'disabled'
    | 'disabled-navigation'
    | 'read-only'
    | 'cancel-open'
    | 'cancel-value'
    | 'cancel-close'
    | 'deferred'
    | 'objects'
    | 'array'
    | 'focus-out'
    | 'modal'
    | 'modal-cancel-close'
    | 'aligned'
    | 'aligned-modal'
    | 'rtl'
    | 'aligned-rtl'
    | 'anchor-default'
    | 'typeahead'
    | 'typeahead-read-only'
    | 'typeahead-multiple'
    | 'typeahead-double-letter'
    | 'typeahead-duplicate-labels'
    | 'typeahead-no-selection'
    | 'typeahead-cancel-value';
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
    modal: boolean;
    aligned: boolean;
    dir: 'ltr' | 'rtl';
    scrollable: boolean;
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
            backgroundActivations: number;
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
        'disabled-navigation',
        'read-only',
        'cancel-open',
        'cancel-value',
        'cancel-close',
        'deferred',
        'objects',
        'array',
        'focus-out',
        'modal',
        'modal-cancel-close',
        'aligned',
        'aligned-modal',
        'rtl',
        'aligned-rtl',
        'anchor-default',
        'typeahead',
        'typeahead-read-only',
        'typeahead-multiple',
        'typeahead-double-letter',
        'typeahead-duplicate-labels',
        'typeahead-no-selection',
        'typeahead-cancel-value'
    ];
    if (!names.includes(name as CaseName)) throw new Error(`Unknown fixture case: ${name}`);
    let options: Option[] = [
        { key: 'apple', label: 'Apple', value: 'apple' },
        { key: 'banana', label: 'Banana', value: 'banana' },
        { key: 'blueberry', label: 'Blueberry', value: 'blueberry', disabled: true },
        { key: 'cherry', label: 'Cherry', value: 'cherry' }
    ];
    if (name === 'disabled-navigation')
        options = [
            { key: 'apple', label: 'Apple', value: 'apple', disabled: true },
            { key: 'apricot', label: 'Apricot', value: 'apricot' },
            { key: 'banana', label: 'Banana', value: 'banana' },
            { key: 'blueberry', label: 'Blueberry', value: 'blueberry', disabled: true },
            { key: 'blackberry', label: 'Blackberry', value: 'blackberry' },
            { key: 'cherry', label: 'Cherry', value: 'cherry', disabled: true }
        ];
    if (name.startsWith('typeahead'))
        options = [
            { key: 'amsterdam', label: 'Amsterdam', value: 'amsterdam' },
            { key: 'berlin', label: 'Berlin', value: 'berlin' },
            { key: 'bern', label: 'Bern', value: 'bern' },
            { key: 'new-york', label: 'New York', value: 'new-york' },
            { key: 'newark', label: 'Newark', value: 'newark' },
            { key: 'new-delhi', label: 'New Delhi', value: 'new-delhi' },
            { key: 'tokyo', label: 'Tokyo', value: 'tokyo', disabled: true }
        ];
    if (name === 'typeahead-double-letter')
        options = [
            { key: 'amsterdam', label: 'Amsterdam', value: 'amsterdam' },
            { key: 'aachen', label: 'Aachen', value: 'aachen' },
            { key: 'aardvark', label: 'Aardvark', value: 'aardvark' },
            { key: 'athens', label: 'Athens', value: 'athens' }
        ];
    if (name === 'typeahead-duplicate-labels')
        options = [
            { key: 'amsterdam', label: 'Amsterdam', value: 'amsterdam' },
            { key: 'berlin-one', label: 'Berlin', value: 'berlin-one' },
            { key: 'berlin-two', label: 'Berlin', value: 'berlin-two' },
            { key: 'bern', label: 'Bern', value: 'bern' }
        ];
    if (name === 'objects')
        options = options.map((option) => ({ ...option, value: { id: option.key, label: option.label } }));
    if (name === 'array')
        options = [
            { key: '10:20', label: '10 × 20', value: [10, 20] },
            { key: '30:40', label: '30 × 40', value: [30, 40] }
        ];
    const multiple = name === 'multiple' || name === 'typeahead-multiple';
    const initial = name.startsWith('aligned')
        ? options[1].value
        : name === 'typeahead-no-selection'
          ? null
          : name === 'disabled-navigation'
            ? options[2].value
            : options[0].value;
    return {
        name: name as CaseName,
        options,
        initial: multiple ? [initial as ItemValue] : initial,
        multiple,
        disabled: name === 'disabled',
        readOnly: name === 'read-only' || name === 'typeahead-read-only',
        defer: name === 'deferred',
        closeOnFocusOut: name === 'focus-out',
        modal: name === 'modal' || name === 'modal-cancel-close' || name === 'aligned-modal',
        aligned: name.startsWith('aligned'),
        dir: name === 'rtl' || name === 'aligned-rtl' ? 'rtl' : 'ltr',
        scrollable: name.startsWith('modal') || name.startsWith('aligned') || name === 'rtl'
    };
}

export function itemKey(value: ItemValue): string {
    return typeof value === 'string' ? value : Array.isArray(value) ? value.join(':') : value.id;
}
export function itemLabel(value: ItemValue, options?: readonly Option[]): string {
    const option = options?.find((option) => Object.is(option.value, value));
    if (option) return option.label;
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
        backgroundActivations: 0,
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
