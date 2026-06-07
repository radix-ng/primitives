/** Narrows to `null | undefined`. */
export function isNullish(value: any): value is null | undefined {
    return value === null || value === undefined;
}

/**
 * Structural equality for the value shapes a primitive can hold: primitives (incl. `NaN`), arrays,
 * plain objects, and the common built-ins `Date`, `RegExp`, `Map`, and `Set`. Reference cycles are
 * handled. Other opaque objects (e.g. class instances with no own enumerable properties) fall back
 * to per-key comparison and so only match when they expose equal enumerable state.
 */
export function isEqual(a: any, b: any): boolean {
    return equals(a, b, new WeakMap());
}

function equals(a: any, b: any, seen: WeakMap<object, unknown>): boolean {
    if (a === b) {
        return true;
    }

    // NaN is the one primitive that is not reference-equal to itself.
    if (typeof a === 'number' && typeof b === 'number') {
        return Number.isNaN(a) && Number.isNaN(b);
    }

    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    // Different prototypes (Date vs plain object, class A vs class B, …) are never structurally equal.
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
        return false;
    }

    // Break reference cycles: if this exact pair is already being compared on the current path,
    // the structure has matched so far — treat it as equal. Cleared on ascent so sibling branches
    // start fresh.
    if (seen.get(a) === b) {
        return true;
    }
    seen.set(a, b);

    try {
        if (a instanceof Date) {
            return a.getTime() === b.getTime();
        }

        if (a instanceof RegExp) {
            return a.source === b.source && a.flags === b.flags;
        }

        if (Array.isArray(a)) {
            return a.length === b.length && a.every((item: unknown, index: number) => equals(item, b[index], seen));
        }

        if (a instanceof Map) {
            if (a.size !== b.size) {
                return false;
            }

            for (const [key, value] of a) {
                if (!b.has(key) || !equals(value, b.get(key), seen)) {
                    return false;
                }
            }

            return true;
        }

        if (a instanceof Set) {
            if (a.size !== b.size) {
                return false;
            }

            for (const value of a) {
                if (!b.has(value)) {
                    return false;
                }
            }

            return true;
        }

        const keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) {
            return false;
        }

        return keys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && equals(a[key], b[key], seen));
    } finally {
        seen.delete(a);
    }
}
