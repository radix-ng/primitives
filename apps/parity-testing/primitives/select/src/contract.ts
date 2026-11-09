import { geometryConfig, geometryNames, type GeometryConfig, type GeometryName } from './geometry';

export type CaseName =
    | GeometryName
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
    | 'dynamic'
    | 'dynamic-multiple'
    | 'dynamic-objects'
    | 'dynamic-cancel-value'
    | 'touch-scroll'
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
    dynamic: boolean;
    geometry?: GeometryConfig;
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
        ...geometryNames,
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
        'dynamic',
        'dynamic-multiple',
        'dynamic-objects',
        'dynamic-cancel-value',
        'touch-scroll',
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
    if (name === 'touch-scroll')
        options = [
            ...options,
            ...Array.from({ length: 30 }, (_, i) => ({ key: `fruit-${i}`, label: `Fruit ${i}`, value: `fruit-${i}` }))
        ];
    if (name === 'objects' || name === 'dynamic-objects')
        options = options.map((option) => ({ ...option, value: { id: option.key, label: option.label } }));
    if (name === 'array')
        options = [
            { key: '10:20', label: '10 × 20', value: [10, 20] },
            { key: '30:40', label: '30 × 40', value: [30, 40] }
        ];
    const geometry = geometryConfig(name);
    if (geometry)
        options = Array.from({ length: geometry.optionCount }, (_, i) => ({
            key: `item-${i}`,
            label: `Item ${String(i).padStart(2, '0')}`,
            value: `item-${i}`
        }));
    const multiple = name === 'multiple' || name === 'typeahead-multiple' || name === 'dynamic-multiple';
    const initial = geometry
        ? geometry.selectedIndex === null
            ? null
            : options[geometry.selectedIndex].value
        : name.startsWith('aligned')
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
        aligned: geometry?.aligned ?? name.startsWith('aligned'),
        dir: geometry?.dir ?? (name === 'rtl' || name === 'aligned-rtl' ? 'rtl' : 'ltr'),
        scrollable: name.startsWith('modal') || name.startsWith('aligned') || name === 'rtl',
        dynamic: name.startsWith('dynamic'),
        geometry
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

export const optionActions = [
    { key: 'add', shortcut: 'F2', label: 'Add Apricot' },
    { key: 'remove-banana', shortcut: 'F3', label: 'Remove Banana' },
    { key: 'remove-apple', shortcut: 'F4', label: 'Remove Apple' },
    { key: 'reverse', shortcut: 'F6', label: 'Reverse options' },
    { key: 'rename', shortcut: 'F7', label: 'Rename Banana to Pear' },
    { key: 'disable', shortcut: 'F8', label: 'Disable Banana' },
    { key: 'replace', shortcut: 'F9', label: 'Reload object values' }
] as const;
export type OptionAction = (typeof optionActions)[number]['key'];

/** Application data changes only; Root still owns selection, highlight, focus and lifecycle. */
export function changeOptions(options: readonly Option[], action: OptionAction): Option[] {
    switch (action) {
        case 'add':
            if (options.some((option) => option.key === 'apricot')) return [...options];
            return [options[0], { key: 'apricot', label: 'Apricot', value: 'apricot' }, ...options.slice(1)];
        case 'remove-banana':
            return options.filter((option) => option.key !== 'banana');
        case 'remove-apple':
            return options.filter((option) => option.key !== 'apple');
        case 'reverse':
            return [...options].reverse();
        case 'rename':
            return options.map((option) => (option.key === 'banana' ? { ...option, label: 'Pear' } : option));
        case 'disable':
            return options.map((option) => (option.key === 'banana' ? { ...option, disabled: true } : option));
        case 'replace':
            return options.map((option) => ({ ...option, value: { id: option.key, label: option.label } }));
    }
}

/** Only adapts callback signatures / serializable representation. Never commits component state. */
export function installProbe(framework: 'angular' | 'react', config: FixtureConfig) {
    const providedValues = new Set(config.options.map((option) => option.value));
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
        observeOptions(options: readonly Option[]) {
            for (const option of options) providedValues.add(option.value);
        },
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
                references: items.every((item) => providedValues.has(item))
            });
            probe.nativeEvents.push(event.type);
        },
        complete(open: boolean) {
            probe.events.push({ type: 'complete', open });
        }
    };
}
