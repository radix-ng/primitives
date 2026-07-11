import { isEqual, isNullish } from './predicates';

/**
 * A comparator for list-item values, aligned with Base UI's `isItemEqualToValue` naming.
 *
 * - a **function** `(a, b) => boolean` — full control over equality;
 * - a **string** — an object key whose values are compared with {@link isEqual} (Reka-style `by`);
 * - omitted — structural deep equality via {@link isEqual}.
 */
export type ItemValueComparator<T = unknown> = ((a: T, b: T) => boolean) | string;

/**
 * Converts an item value to the string shown to the user.
 *
 * Strings pass through unchanged; `null`/`undefined` become an empty string; everything else is
 * coerced with `String()`. Primitives that hold object values (e.g. combobox) typically pass their
 * own `itemToStringLabel` to render a field off the object instead.
 */
export function itemToStringLabel(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    if (isNullish(value)) {
        return '';
    }
    return String(value);
}

/**
 * Converts an item value to the string used for form serialization. A conventional `{ value, label }`
 * item serializes its `value` member; other non-string values use Base UI-compatible JSON serialization
 * with `String()` as a fallback. Kept separate so a primitive can diverge label vs. value.
 */
export function itemToStringValue(value: unknown): string {
    if (value !== null && typeof value === 'object' && 'value' in value && 'label' in value) {
        return serializeValue((value as { value: unknown }).value);
    }

    return serializeValue(value);
}

/** Base UI-compatible serialization fallback for native form values. */
function serializeValue(value: unknown): string {
    if (isNullish(value)) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }

    try {
        return JSON.stringify(value) ?? String(value);
    } catch {
        return String(value);
    }
}

/**
 * Compares two item values for equality using an optional {@link ItemValueComparator}.
 *
 * @example
 * isItemEqualToValue({ id: 1 }, { id: 1 }, 'id'); // true — compares the `id` key
 * isItemEqualToValue({ id: 1 }, { id: 1 });       // true — deep equality fallback
 */
export function isItemEqualToValue<T>(a: T, b: T, comparator?: ItemValueComparator<T>): boolean {
    if (typeof comparator === 'function') {
        return comparator(a, b);
    }

    if (typeof comparator === 'string') {
        if (isNullish(a) || isNullish(b)) {
            return a === b;
        }
        return isEqual((a as Record<string, unknown>)[comparator], (b as Record<string, unknown>)[comparator]);
    }

    return isEqual(a, b);
}
