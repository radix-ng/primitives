import { compareItemEquality, getActiveElement, ItemValueComparator } from '@radix-ng/primitives/core';

export const OPEN_KEYS = [' ', 'Enter', 'ArrowUp', 'ArrowDown'];
export const SELECTION_KEYS = [' ', 'Enter'];
export const CONTENT_MARGIN = 10;

export interface RdxSelectItemMetadata<Value = unknown> {
    [key: string]: unknown;
    value: Value | undefined;
    disabled: boolean;
    textValue?: string;
    textElement?: HTMLElement;
}

export function valueComparator<T>(
    value: T | T[] | null | undefined,
    currentValue: T | undefined,
    comparator?: ItemValueComparator<T>,
    multiple = Array.isArray(value)
) {
    if (value === undefined) return false;
    else if (multiple) return Array.isArray(value) && value.some((val: T) => compare(val, currentValue, comparator));
    // `multiple` identifies the outer collection; T itself may be an array.
    else return compare(value as T | null, currentValue, comparator);
}

export function compare<T>(value?: T | null, currentValue?: T | null, comparator?: ItemValueComparator<T>) {
    if (value === undefined || currentValue === undefined) return false;

    return compareItemEquality(value, currentValue, (a, b) => {
        if (typeof comparator === 'function') return comparator(a, b);
        if (typeof comparator === 'string') return a[comparator as keyof T] === b[comparator as keyof T];
        return Object.is(a, b);
    });
}

export function shouldShowPlaceholder(value?: unknown): boolean {
    return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

export function focusFirst(candidates: HTMLElement[]) {
    const PREVIOUSLY_FOCUSED_ELEMENT = getActiveElement();
    for (const candidate of candidates) {
        // if focus is already where we want to go, we don't want to keep going through the candidates
        if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
        candidate.focus();
        if (getActiveElement() !== PREVIOUSLY_FOCUSED_ELEMENT) return;
    }
}
