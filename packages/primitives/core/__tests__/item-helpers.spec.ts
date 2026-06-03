import { isItemEqualToValue, itemToStringLabel, itemToStringValue } from '../src/item-helpers';
import { describe, expect, it } from 'vitest';

describe('itemToStringLabel', () => {
    it('passes strings through unchanged', () => {
        expect(itemToStringLabel('Apple')).toBe('Apple');
    });

    it('maps nullish values to an empty string', () => {
        expect(itemToStringLabel(null)).toBe('');
        expect(itemToStringLabel(undefined)).toBe('');
    });

    it('coerces other values with String()', () => {
        expect(itemToStringLabel(42)).toBe('42');
        expect(itemToStringLabel(true)).toBe('true');
    });
});

describe('itemToStringValue', () => {
    it('follows the same rules as itemToStringLabel', () => {
        expect(itemToStringValue('x')).toBe('x');
        expect(itemToStringValue(null)).toBe('');
        expect(itemToStringValue(7)).toBe('7');
    });
});

describe('isItemEqualToValue', () => {
    it('uses a function comparator when provided', () => {
        const byId = (a: { id: number }, b: { id: number }) => a.id === b.id;
        expect(isItemEqualToValue({ id: 1 }, { id: 1 }, byId)).toBe(true);
        expect(isItemEqualToValue({ id: 1 }, { id: 2 }, byId)).toBe(false);
    });

    it('compares by object key when given a string comparator', () => {
        expect(isItemEqualToValue({ id: 1, name: 'A' }, { id: 1, name: 'B' }, 'id')).toBe(true);
        expect(isItemEqualToValue({ id: 1 }, { id: 2 }, 'id')).toBe(false);
    });

    it('falls back to identity for nullish values with a key comparator', () => {
        expect(isItemEqualToValue(null, null, 'id')).toBe(true);
        expect(isItemEqualToValue(null, { id: 1 } as any, 'id')).toBe(false);
    });

    it('falls back to deep equality without a comparator', () => {
        expect(isItemEqualToValue({ id: 1, nested: { a: 1 } }, { id: 1, nested: { a: 1 } })).toBe(true);
        expect(isItemEqualToValue('a', 'a')).toBe(true);
        expect(isItemEqualToValue({ id: 1 }, { id: 2 })).toBe(false);
    });
});
