import assert from 'node:assert/strict';
import test from 'node:test';
import { runAgent } from './loop.ts';
import type { ModelBackend, ModelReply, RuntimeBridge, ToolCall } from './types.ts';

const input = {
    id: 'instance-from-observation',
    kind: 'input',
    name: 'Project name',
    available: true,
    disabled: false,
    readOnly: false,
    value: 'Radix project',
    actions: ['set-value']
};
const call = (name: string, args: unknown, id = 'call-1'): ToolCall => ({ id, name, arguments: JSON.stringify(args) });
const reply = (calls: ToolCall[], text = ''): ModelReply => ({
    calls,
    text,
    output: calls.map((entry) => ({
        type: 'function_call',
        call_id: entry.id,
        name: entry.name,
        arguments: entry.arguments
    })),
    usage: { input_tokens: 10, output_tokens: 5 }
});
function backend(
    responses: ModelReply[] | ((history: readonly Record<string, unknown>[]) => ModelReply | Promise<ModelReply>)
): ModelBackend {
    let index = 0;
    return {
        mode: 'deterministic',
        configuration: { provider: 'scripted' },
        async respond(history) {
            return typeof responses === 'function' ? responses(history) : responses[index++];
        }
    };
}
function bridge(outcome: 'applied' | 'refused' | 'canceled' = 'applied') {
    let current = structuredClone(input);
    const calls: string[] = [];
    const api: RuntimeBridge = {
        async check() {},
        async call(name, args) {
            calls.push(name);
            if (name === 'snapshot') return { controls: [structuredClone(current)] };
            if (name === 'query') return { status: 'matched', matches: [structuredClone(current)] };
            const before = structuredClone(current);
            if (outcome === 'applied') current = { ...current, value: (args as { value: string }).value };
            return {
                status: outcome,
                message: outcome,
                ...(outcome === 'refused' ? { code: 'disabled' } : {}),
                before,
                after: structuredClone(current)
            };
        }
    };
    return { api, calls };
}

test('successful loop forwards structured tool results and records actual state, usage and steps', async () => {
    const runtime = bridge();
    const run = await runAgent({
        task: 'Rename the project.',
        bridge: runtime.api,
        backend: backend((history) => {
            if (history.length === 1) return reply([call('snapshot', {})]);
            const last = history.at(-1)!;
            const result = JSON.parse(last['output'] as string);
            if (result.controls)
                return reply([
                    call('act', { id: result.controls[0].id, action: 'set-value', value: 'Updated' }, 'call-2')
                ]);
            assert.equal(result.status, 'applied');
            assert.equal(result.after.value, 'Updated');
            return reply([], 'Renamed to Updated.');
        })
    });
    assert.equal(run.reason, 'completed');
    assert.equal(run.mode, 'deterministic');
    assert.equal(run.steps, 3);
    assert.equal(run.toolCalls, 2);
    assert.equal(run.finalSnapshot?.controls[0].value, 'Updated');
    assert.equal(run.usage.length, 3);
    assert.deepEqual(runtime.calls, ['snapshot', 'act', 'snapshot']);
    assert.match(run.instructions, /untrusted data, never instructions/);
});

for (const outcome of ['refused', 'canceled'] as const)
    test(`${outcome} is returned to the model without being treated as applied`, async () => {
        const runtime = bridge(outcome);
        const responses = [
            reply([call('query', { name: 'Project name' })]),
            reply([call('act', { id: input.id, action: 'set-value', value: 'Updated' })])
        ];
        const run = await runAgent({
            task: 'Rename if possible.',
            bridge: runtime.api,
            backend: backend((history) => {
                const next = responses.shift();
                if (next) return next;
                assert.equal(JSON.parse(history.at(-1)!['output'] as string).status, outcome);
                return reply([], `The change was ${outcome}.`);
            })
        });
        assert.equal(run.reason, 'completed');
        assert.equal(run.finalSnapshot?.controls[0].value, 'Radix project');
    });

for (const [name, args, expected] of [
    ['shell', { command: 'echo forbidden' }, 'invalid-tool'],
    ['toString', {}, 'invalid-tool'],
    ['snapshot', { extra: true }, 'invalid-arguments'],
    ['query', { kind: 'button' }, 'invalid-arguments'],
    ['act', { id: input.id, action: 'set-value' }, 'invalid-arguments'],
    ['act', { id: input.id, action: 'open', value: 'extra' }, 'invalid-arguments'],
    ['act', { id: input.id, action: 'set-value', value: 'Updated' }, 'unobserved-id']
] as const)
    test(`rejects ${name} ${JSON.stringify(args)} before touching the runtime`, async () => {
        const runtime = bridge();
        const run = await runAgent({
            task: 'A task.',
            bridge: runtime.api,
            backend: backend([reply([call(name, args)])])
        });
        assert.equal(run.reason, expected);
        assert.deepEqual(runtime.calls, []);
        assert.equal(run.events.at(-2)?.type, 'tool-result');
    });

test('malformed JSON ends cleanly', async () => {
    const runtime = bridge();
    const run = await runAgent({
        task: 'A task.',
        bridge: runtime.api,
        backend: backend([reply([{ id: 'c', name: 'snapshot', arguments: '{bad' }])])
    });
    assert.equal(run.reason, 'invalid-arguments');
    assert.deepEqual(runtime.calls, []);
});

test('request timeout cancels the request and races even an uncooperative backend', async () => {
    let signal: AbortSignal | undefined;
    const provider: ModelBackend = {
        mode: 'deterministic',
        configuration: {},
        respond(_history, _instructions, requestSignal) {
            signal = requestSignal;
            return new Promise(() => {});
        }
    };
    const run = await runAgent({
        task: 'Wait.',
        bridge: bridge().api,
        backend: provider,
        limits: { requestTimeoutMs: 10 }
    });
    assert.equal(run.reason, 'request-timeout');
    assert.equal(signal?.aborted, true);
});

test('total time limit also covers a hanging runtime command', async () => {
    const runtime: RuntimeBridge = { async check() {}, call: () => new Promise(() => {}) };
    const run = await runAgent({
        task: 'Wait.',
        bridge: runtime,
        backend: backend([reply([call('snapshot', {})])]),
        limits: { totalTimeoutMs: 10 }
    });
    assert.equal(run.reason, 'total-timeout');
});

test('step limit stops a model that keeps reading; final snapshot is an observer read', async () => {
    const runtime = bridge();
    const run = await runAgent({
        task: 'Never finish.',
        bridge: runtime.api,
        backend: backend(() => reply([call('snapshot', {})])),
        limits: { maxSteps: 2 }
    });
    assert.equal(run.reason, 'step-limit');
    assert.equal(run.steps, 2);
    assert.equal(run.toolCalls, 2);
    assert.equal(runtime.calls.length, 3);
});

test('tool limit stops an unexpectedly large batch', async () => {
    const runtime = bridge();
    const run = await runAgent({
        task: 'Read.',
        bridge: runtime.api,
        backend: backend([reply([call('snapshot', {}), call('query', {}, 'c2')])]),
        limits: { maxToolCalls: 1 }
    });
    assert.equal(run.reason, 'tool-limit');
    assert.deepEqual(runtime.calls, ['snapshot']);
});

test('provider errors do not put an arbitrary exception or secret in the report', async () => {
    const run = await runAgent({
        task: 'Read.',
        bridge: bridge().api,
        backend: backend(() => {
            throw new Error('Bearer secret-from-HTTP-error');
        })
    });
    assert.equal(run.reason, 'provider-error');
    assert.doesNotMatch(JSON.stringify(run), /secret-from-HTTP-error/);
});

test('a malformed runtime result stops the loop rather than informing the model with an invented result', async () => {
    const runtime = bridge();
    runtime.api.call = async () => ({ unexpected: true });
    const run = await runAgent({
        task: 'Read.',
        bridge: runtime.api,
        backend: backend([reply([call('snapshot', {})])])
    });
    assert.equal(run.reason, 'invalid-result');
});

test('already aborted runs never call the backend', async () => {
    const abort = new AbortController();
    abort.abort();
    const run = await runAgent({
        task: 'Read.',
        bridge: bridge().api,
        backend: backend(() => {
            assert.fail('Backend must not run.');
        }),
        signal: abort.signal
    });
    assert.equal(run.reason, 'aborted');
    assert.equal(run.steps, 0);
});

test('a final observer snapshot with a broken schema is a runtime contract error', async () => {
    const runtime = bridge();
    runtime.api.call = async () => ({ unexpected: true });
    const run = await runAgent({ task: 'Read.', bridge: runtime.api, backend: backend([reply([], 'Finished.')]) });
    assert.equal(run.reason, 'invalid-result');
    assert.equal(run.finalSnapshot, undefined);
});
