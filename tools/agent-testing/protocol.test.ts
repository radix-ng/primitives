import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'zod';
import { actionNames, controlKinds } from '../../apps/radix-playground/src/app/agent-runtime/protocol.ts';
import { toolDefinitions, toolInputSchemas } from './schemas.ts';

test('published JSON Schemas are generated from the actual boundary validators without dropping constraints', () => {
    for (const tool of toolDefinitions) {
        assert.deepEqual(tool.inputSchema, {
            type: 'object',
            ...z.toJSONSchema(toolInputSchemas[tool.name], { target: 'draft-7' })
        });
        const objects: Record<string, unknown>[] = [];
        function visit(value: unknown) {
            if (typeof value !== 'object' || !value) return;
            if ((value as Record<string, unknown>)['type'] === 'object') objects.push(value as Record<string, unknown>);
            for (const child of Object.values(value)) visit(child);
        }
        visit(tool.inputSchema);
        for (const object of objects.filter((entry) => entry['properties']))
            assert.equal(object['additionalProperties'], false);
    }
    assert.deepEqual(controlKinds, ['input', 'select', 'dialog']);
    assert.deepEqual(actionNames, ['set-value', 'select-option', 'open', 'close']);
});

test('required fields, action-dependent value arguments, option values and unknown fields have exact schemas', () => {
    for (const action of actionNames) {
        const needsValue = action === 'set-value' || action === 'select-option';
        assert.equal(toolInputSchemas.act.safeParse({ id: 'id', action }).success, !needsValue);
        assert.equal(toolInputSchemas.act.safeParse({ id: 'id', action, value: '' }).success, needsValue);
        assert.equal(toolInputSchemas.act.safeParse({ id: 'id', action, value: null }).success, false);
        assert.equal(
            toolInputSchemas.act.safeParse({ id: 'id', action, extra: true, ...(needsValue ? { value: '' } : {}) })
                .success,
            false
        );
    }
    for (const invalid of [null, [], { name: null }, { kind: 'button' }, { name: 'x', extra: true }])
        assert.equal(toolInputSchemas.query.safeParse(invalid).success, false);
    for (const valid of [{}, { id: 'x' }, { name: 'Visibility', kind: 'select' }])
        assert.equal(toolInputSchemas.query.safeParse(valid).success, true);
});
