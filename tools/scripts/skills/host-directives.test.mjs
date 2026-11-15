import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compodocBindingName, composeHostDirectives } from '../../compodoc/host-directives.ts';

test('composed metadata publishes only exposed bindings, including nested aliases and outputs', () => {
    const source = {
        name: 'Source',
        inputsClass: [
            { name: 'targetInput', defaultValue: "undefined, { alias: 'target' }", description: 'Native target' },
            { name: 'internal' }
        ],
        outputsClass: [{ name: 'changed', type: 'boolean' }]
    };
    const wrapper = {
        name: 'Wrapper',
        hostDirectives: [{ name: 'Source', inputs: ['target: container'], outputs: ['changed: done'] }]
    };
    const outer = { name: 'Outer', hostDirectives: [{ name: 'Wrapper', inputs: ['container: destination'] }] };
    const input = structuredClone([outer, wrapper, source]);
    const result = composeHostDirectives(input);
    assert.deepEqual(result[0].inputsClass.map(compodocBindingName), ['destination']);
    assert.equal(result[0].inputsClass[0].description, 'Native target');
    assert.deepEqual(result[0].outputsClass, []);
    assert.deepEqual(result[1].outputsClass.map(compodocBindingName), ['done']);
    assert.equal(result[1].outputsClass[0].type, 'boolean');
    result[0].inputsClass[0].description = 'Mutated';
    assert.equal(result[1].inputsClass[0].description, 'Native target');
    assert.deepEqual(input, [outer, wrapper, source]);
});

test('own bindings override exposed host inputs and unexposed hosts remain private', () => {
    const result = composeHostDirectives([
        {
            name: 'Owner',
            inputsClass: [{ name: 'disabled', defaultValue: 'true' }],
            hostDirectives: [{ name: 'Host', inputs: ['disabled'] }, { name: 'Private' }, { name: 'Missing' }]
        },
        { name: 'Host', inputsClass: [{ name: 'disabled', defaultValue: 'false' }, { name: 'hidden' }] },
        { name: 'Private', inputsClass: [{ name: 'private' }] }
    ]);
    assert.deepEqual(result[0].inputsClass, [{ name: 'disabled', defaultValue: 'true' }]);
});

test('composed model bindings retain two-way metadata; independently aliased outputs use their real name', () => {
    const [paired, outputOnly] = composeHostDirectives([
        {
            name: 'Paired',
            hostDirectives: [{ name: 'Source', inputs: ['open: expanded'], outputs: ['openChange: expandedChange'] }]
        },
        { name: 'OutputOnly', hostDirectives: [{ name: 'Paired', outputs: ['expandedChange: changed'] }] },
        {
            name: 'Source',
            inputsClass: [{ name: 'open', defaultValue: 'false' }],
            outputsClass: [{ name: 'open', defaultValue: 'false' }]
        }
    ]);
    assert.deepEqual(paired.inputsClass.map(compodocBindingName), ['expanded']);
    assert.deepEqual(paired.outputsClass.map(compodocBindingName), ['expanded']);
    assert.deepEqual(outputOnly.inputsClass, []);
    assert.deepEqual(outputOnly.outputsClass.map(compodocBindingName), ['changed']);
});
