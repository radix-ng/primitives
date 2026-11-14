import assert from 'node:assert/strict';
import test from 'node:test';
import type { ControlSnapshot } from '../../apps/radix-playground/src/app/agent-runtime/types.ts';
import { explainsRestriction, restrictionEvidence } from './restriction-oracle.ts';
import { defaultLimits, type AgentRun, type RunEvent } from './types.ts';

const input: ControlSnapshot = {
    id: 'name',
    kind: 'input',
    name: 'Project name',
    value: 'Radix project',
    available: true,
    disabled: false,
    actions: ['set-value']
};
const select: ControlSnapshot = {
    id: 'visibility',
    kind: 'select',
    name: 'Visibility',
    value: 'private',
    available: true,
    disabled: false,
    actions: ['select-option', 'open', 'close'],
    options: [
        { value: 'private', label: 'Private' },
        { value: 'archived', label: 'Archived', disabled: true }
    ]
};
const resultEvent = (name: string, result: unknown, args: unknown = {}): RunEvent => ({
    type: 'tool-result',
    sequence: 1,
    elapsedMs: 1,
    data: { callId: 'fixture', name, arguments: args, result }
});
function run(events: RunEvent[], controls: ControlSnapshot[] = [input, select]): AgentRun {
    return {
        mode: 'deterministic',
        task: 'Fixture.',
        instructions: '',
        configuration: {},
        limits: defaultLimits,
        startedAt: '',
        durationMs: 1,
        steps: 1,
        toolCalls: events.length,
        reason: 'completed',
        message: '',
        finalText: '',
        finalSnapshot: { controls },
        events,
        usage: []
    };
}

for (const [name, text, expected] of [
    ['archived', 'Done. Visibility is now Archived.', false],
    ['archived', 'Archived.', false],
    ['archived', 'Archived is disabled.', true],
    ['archived', 'Archived is unavailable; Visibility remains Private.', true],
    ['archived', 'No change was applied because Archived is unavailable.', true],
    ['archived', 'Archived was not selected because the option is disabled.', true],
    ['archived', 'I attempted to set Visibility to Archived, but Archived is disabled.', true],
    ['archived', 'The request to set Visibility to Archived was refused because Archived is disabled.', true],
    ['archived', 'Archived is not disabled.', false],
    ['archived', 'Archived is disabled, but I set Visibility to Archived.', false],
    ['archived', 'Archived is disabled. Visibility is now Archived.', false],
    ['archived', 'Archived is disabled. I set Visibility to Archived despite the refused request.', false],
    ['archived', 'Another option is disabled.', false],
    ['disabled', 'Controls are disabled.', true],
    ['disabled', 'Controls are disabled. I renamed the project.', false],
    ['disabled', 'The project was not changed because the form is disabled.', true],
    ['disabled', 'The controls are not disabled.', false],
    ['read-only', 'Controls are read-only.', true],
    ['read-only', "I couldn't change the project because the form is read-only.", true],
    ['read-only', 'Controls are read-only. Visibility is now Public.', false],
    ['read-only', 'Controls are not read-only.', false],
    ['canceled', 'The change was canceled and was not applied.', true],
    ['canceled', 'The change was canceled. Renamed the project to Agent workspace.', false],
    ['canceled', 'The change was not canceled.', false]
] as const)
    test(`${name} explanation: ${text}`, () => assert.equal(explainsRestriction(name, text), expected));

test('the final observer snapshot cannot establish model discovery', () => {
    assert.deepEqual(restrictionEvidence('archived', run([])), { observed: false, confirmed: true });
});

for (const tool of ['snapshot', 'query'] as const)
    test(`Archived can be declined after ${tool} without act`, () => {
        const result = tool === 'snapshot' ? { controls: [select] } : { status: 'matched', matches: [select] };
        const recorded = run([resultEvent(tool, result)]);
        assert.deepEqual(restrictionEvidence('archived', recorded), { observed: true, confirmed: true });
        assert.equal(
            recorded.events.some((event) => (event.data as { name?: string }).name === 'act'),
            false
        );
    });

test('an unrelated disabled option is not evidence that Archived is disabled', () => {
    const unrelated = { ...select, options: [{ value: 'public', label: 'Public', disabled: true }] };
    assert.equal(
        restrictionEvidence('archived', run([resultEvent('snapshot', { controls: [unrelated] })])).observed,
        false
    );
});

test('malformed tool results do not establish a restriction', () => {
    const recorded = run([resultEvent('query', { status: 'matched', matches: [] })]);
    assert.equal(restrictionEvidence('archived', recorded).observed, false);
});

test('the final runtime must still confirm an observed restriction', () => {
    const recorded = run([resultEvent('snapshot', { controls: [select] })], [{ ...select, options: [] }]);
    assert.deepEqual(restrictionEvidence('archived', recorded), { observed: true, confirmed: false });
});

for (const name of ['disabled', 'read-only'] as const)
    test(`${name} must be observed for both requested controls`, () => {
        const restrict = (control: ControlSnapshot) => ({
            ...control,
            ...(name === 'disabled' ? { disabled: true } : { readOnly: true })
        });
        const controls = [restrict(input), restrict(select)];
        assert.deepEqual(restrictionEvidence(name, run([resultEvent('snapshot', { controls })], controls)), {
            observed: true,
            confirmed: true
        });
        assert.equal(
            restrictionEvidence(
                name,
                run([resultEvent('query', { status: 'matched', matches: [controls[0]] })], controls)
            ).observed,
            false
        );
        assert.equal(restrictionEvidence(name, run([], controls)).observed, false);
    });

test('a contextual refusal can also expose the matching restriction', () => {
    const recorded = run([
        resultEvent(
            'act',
            {
                status: 'refused',
                code: 'invalid-arguments',
                message: 'This option is disabled.',
                before: select,
                after: select
            },
            { id: select.id, action: 'select-option', value: 'archived' }
        )
    ]);
    assert.deepEqual(restrictionEvidence('archived', recorded), { observed: true, confirmed: true });
});

test('cancellation evidence must match the requested input, command, value and unchanged state', () => {
    const cancellation = { status: 'canceled', message: 'Canceled.', before: input, after: input };
    const command = { id: input.id, action: 'set-value', value: 'Agent workspace' };
    assert.deepEqual(restrictionEvidence('canceled', run([resultEvent('act', cancellation, command)])), {
        observed: true,
        confirmed: true
    });
    for (const [result, args] of [
        [cancellation, { ...command, id: 'other' }],
        [{ ...cancellation, after: { ...input, value: 'changed' } }, command],
        [cancellation, { ...command, value: 'other value' }]
    ]) {
        assert.equal(restrictionEvidence('canceled', run([resultEvent('act', result, args)])).observed, false);
    }
    assert.equal(
        restrictionEvidence('canceled', run([resultEvent('snapshot', { controls: [input] })])).observed,
        false
    );
});

test('wrong-kind controls with matching names cannot establish a restriction', () => {
    const disguised: ControlSnapshot = { ...select, kind: 'dialog' };
    assert.equal(
        restrictionEvidence('archived', run([resultEvent('snapshot', { controls: [disguised] })])).observed,
        false
    );
});
