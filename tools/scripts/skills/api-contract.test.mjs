import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanDefault, cleanType, twoWayBindings } from './api-contract.mjs';

test('model and ordinary aliased input-output pairs publish two-way bindings', () => {
    assert.deepEqual(twoWayBindings([{ name: 'checked' }], [{ name: 'checked' }]), ['checked']);
    assert.deepEqual(
        twoWayBindings(
            [{ name: 'valueInput', bindingAlias: 'value' }],
            [{ name: 'valueChange' }, { name: 'onValueChange' }]
        ),
        ['value']
    );
    assert.deepEqual(
        twoWayBindings(
            [{ name: 'valueInput', defaultValue: "undefined, { alias: 'value' }" }],
            [{ name: 'valueChange' }]
        ),
        ['value']
    );
});

test('request outputs without the matching Angular change name do not imply two-way binding', () => {
    assert.deepEqual(twoWayBindings([{ name: 'value' }], [{ name: 'onValueChange' }]), []);
    assert.deepEqual(twoWayBindings([], [{ name: 'valueChange' }]), []);
    assert.deepEqual(twoWayBindings(), []);
});

test('aliased positioning inputs publish the effective config default and authored fallback', () => {
    const input = {
        name: 'alignInput',
        defaultValue: "undefined, { alias: 'align' }",
        jsdoctags: [{ tagName: { escapedText: 'defaultValue' }, comment: '<p>&#39;center&#39;</p>' }]
    };
    assert.equal(cleanDefault(input), "'center'");
    assert.equal(cleanDefault(input, { align: "'start'" }), "'start'");
    assert.equal(cleanDefault({ name: 'anchor', defaultValue: 'undefined' }), 'undefined');
});

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
