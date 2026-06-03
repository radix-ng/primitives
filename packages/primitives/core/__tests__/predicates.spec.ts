import { isEqual, isNullish } from '../src/predicates';
import { describe, expect, it } from 'vitest';

describe('isNullish', () => {
    it('is true only for null and undefined', () => {
        expect(isNullish(null)).toBe(true);
        expect(isNullish(undefined)).toBe(true);
        expect(isNullish(0)).toBe(false);
        expect(isNullish('')).toBe(false);
        expect(isNullish(false)).toBe(false);
        expect(isNullish(NaN)).toBe(false);
    });
});

describe('isEqual', () => {
    it('compares primitives by value', () => {
        expect(isEqual('a', 'a')).toBe(true);
        expect(isEqual(1, 1)).toBe(true);
        expect(isEqual(1n, 1n)).toBe(true);
        expect(isEqual('a', 'b')).toBe(false);
        expect(isEqual(1, 2)).toBe(false);
        expect(isEqual(1, '1')).toBe(false);
    });

    it('handles null/undefined', () => {
        expect(isEqual(null, null)).toBe(true);
        expect(isEqual(undefined, undefined)).toBe(true);
        expect(isEqual(null, undefined)).toBe(false);
        expect(isEqual(null, {})).toBe(false);
        expect(isEqual({}, null)).toBe(false);
    });

    it('compares plain objects structurally, ignoring key order', () => {
        expect(isEqual({ id: 1, name: 'a' }, { name: 'a', id: 1 })).toBe(true);
        expect(isEqual({ id: 1 }, { id: 2 })).toBe(false);
        expect(isEqual({ id: 1 }, { id: 1, extra: true })).toBe(false);
        expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
        expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    it('compares arrays element-wise', () => {
        expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
        expect(isEqual([{ id: 1 }], [{ id: 1 }])).toBe(true);
        // an array and a plain object are never equal
        expect(isEqual([], {})).toBe(false);
    });

    it('treats NaN as equal to NaN', () => {
        expect(isEqual(NaN, NaN)).toBe(true);
        expect(isEqual(NaN, 1)).toBe(false);
    });

    it('compares Date by timestamp, not as an empty object', () => {
        expect(isEqual(new Date(0), new Date(0))).toBe(true);
        expect(isEqual(new Date(0), new Date(5))).toBe(false);
        // a Date and a plain object must not be considered equal
        expect(isEqual(new Date(0), {})).toBe(false);
    });

    it('compares RegExp by source and flags', () => {
        expect(isEqual(/a/gi, /a/gi)).toBe(true);
        expect(isEqual(/a/g, /a/i)).toBe(false);
    });

    it('compares Map and Set by contents', () => {
        expect(isEqual(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true);
        expect(isEqual(new Map([['a', 1]]), new Map([['a', 2]]))).toBe(false);
        expect(isEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
        expect(isEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
        // distinct collection types are never equal
        expect(isEqual(new Map(), new Set())).toBe(false);
    });

    it('distinguishes different class instances with no own enumerable state', () => {
        class A {}
        class B {}
        expect(isEqual(new A(), new B())).toBe(false);
    });

    it('handles circular references without overflowing', () => {
        const a: any = { id: 1 };
        a.self = a;
        const b: any = { id: 1 };
        b.self = b;
        expect(isEqual(a, b)).toBe(true);

        const c: any = { id: 2 };
        c.self = c;
        expect(isEqual(a, c)).toBe(false);
    });
});
