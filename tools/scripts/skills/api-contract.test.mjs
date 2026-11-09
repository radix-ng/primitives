import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanType } from './api-contract.mjs';

test('generic Select mode metadata exposes its read type, not the transform argument', () => {
    assert.equal(cleanType('Multiple, Multiple | Exclude<BooleanInput, boolean>'), 'Multiple');
});

test('nested selection types remain intact', () => {
    assert.equal(cleanType('RdxSelectValueType<Value, Multiple>'), 'RdxSelectValueType<Value, Multiple>');
    assert.equal(cleanType('Map<string, [number, boolean]>, InputValue'), 'Map<string, [number, boolean]>');
});

test('callbacks, tuples, object shapes and string literals do not lose their commas', () => {
    for (const type of [
        '(item: Value, selected: Value) => boolean',
        'Array<(item: Value, index: number) => string>',
        '[string, number]',
        '{ first: string, second: number }',
        "'a,b' | 'c'"
    ]) {
        assert.equal(cleanType(type), type);
    }
});

test('existing boolean and number coercions still report their value type', () => {
    assert.equal(cleanType('boolean, BooleanInput'), 'boolean');
    assert.equal(cleanType('number, NumberInput'), 'number');
    assert.equal(cleanType(), '');
    assert.equal(cleanType(null), '');
});
