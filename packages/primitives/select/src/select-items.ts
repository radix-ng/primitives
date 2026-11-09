import { itemToStringValue } from '@radix-ng/primitives/core';

/** Text labels are the Angular counterpart of the labels rendered by Base UI Select.Value. */
export type RdxSelectLabelValue = string | number | null | undefined;

export interface RdxSelectItemOption<Value = unknown> {
    value: Value | null;
    label: RdxSelectLabelValue;
}

export interface RdxSelectItemGroup<Value = unknown> {
    [key: string]: unknown;
    items: readonly RdxSelectItemOption<Value>[];
}

export type RdxSelectItems<Value = unknown> =
    | Readonly<Record<string, RdxSelectLabelValue>>
    | readonly RdxSelectItemOption<Value>[]
    | readonly RdxSelectItemGroup<Value>[];

function leafItems<Value>(items: RdxSelectItems<Value>): readonly RdxSelectItemOption<Value>[] {
    const list = items as readonly (RdxSelectItemOption<Value> | RdxSelectItemGroup<Value>)[];
    const first = list[0];
    return first && 'items' in first && Array.isArray(first.items)
        ? (list as readonly RdxSelectItemGroup<Value>[]).flatMap((group) => group.items)
        : (list as readonly RdxSelectItemOption<Value>[]);
}

export function hasSelectNullLabel(items: RdxSelectItems | undefined): boolean {
    if (!items) return false;
    return Array.isArray(items)
        ? leafItems(items).some((item) => item.value == null && item.label != null)
        : Object.hasOwn(items, 'null');
}

/** Mirrors Base UI internals/resolveValueLabel.tsx for Angular text labels. */
export function resolveSelectLabel<Value>(
    value: Value | null | undefined,
    items: RdxSelectItems<Value> | undefined,
    customLabel: ((value: Value) => string) | undefined
): string {
    if (customLabel && value != null) return customLabel(value) ?? '';
    if (value && typeof value === 'object' && 'label' in value && value['label'] != null) {
        return String(value['label']);
    }

    if (items && !Array.isArray(items)) {
        const labels = items as Readonly<Record<string, RdxSelectLabelValue>>;
        const key = String(value);
        if (Object.hasOwn(labels, key) && labels[key] != null) return String(labels[key]);
    } else if (items) {
        const key = value && typeof value === 'object' ? ('value' in value ? value['value'] : undefined) : value;
        if (value == null || typeof value !== 'object' || 'value' in value) {
            const match = leafItems(items).find((item) => item.value === key);
            if (match?.label != null) return String(match.label);
        }
    }

    if (value && typeof value === 'object' && 'value' in value) return String(value['value']);
    return itemToStringValue(value);
}
