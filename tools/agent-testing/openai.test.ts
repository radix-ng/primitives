import assert from 'node:assert/strict';
import test from 'node:test';
import { openAIBackend } from './openai.ts';
import { RunFailure } from './types.ts';

test('official SDK wire requests expose only runtime tools and preserve replayable reasoning/phase', async () => {
    const requests: { url: string; headers: Headers; body: Record<string, unknown> }[] = [];
    const fetchMock: typeof fetch = async (url, options) => {
        requests.push({
            url: String(url),
            headers: new Headers(options?.headers),
            body: JSON.parse(options?.body as string)
        });
        return new Response(
            JSON.stringify({
                id: 'response-1',
                status: 'completed',
                model: 'fixture-model',
                output: [
                    {
                        type: 'reasoning',
                        id: 'reasoning-1',
                        summary: [],
                        encrypted_content: 'fixture-encrypted-reasoning'
                    },
                    {
                        type: 'message',
                        id: 'update-1',
                        role: 'assistant',
                        phase: 'commentary',
                        content: [{ type: 'output_text', text: 'Inspecting.' }]
                    },
                    {
                        type: 'function_call',
                        id: 'function-1',
                        call_id: 'call-1',
                        name: 'snapshot',
                        arguments: '{}',
                        status: 'completed'
                    }
                ],
                usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 }
            }),
            { headers: { 'content-type': 'application/json' } }
        );
    };
    const backend = openAIBackend({ apiKey: 'not-a-real-key', model: 'fixture-model' }, { fetch: fetchMock });
    const history = [{ role: 'user', content: 'A task.' }];
    const result = await backend.respond(history, 'Instructions.', new AbortController().signal);
    assert.equal(result.text, ''); // An intermediate commentary is not a final answer.
    assert.deepEqual(result.calls, [{ id: 'call-1', name: 'snapshot', arguments: '{}' }]);
    assert.equal(result.output[0]['encrypted_content'], 'fixture-encrypted-reasoning');
    assert.equal(result.output[1]['phase'], 'commentary');
    assert.equal(requests[0].url, 'https://api.openai.com/v1/responses');
    assert.equal(requests[0].headers.get('authorization'), 'Bearer not-a-real-key');
    assert.equal(requests[0].body['store'], false);
    assert.equal(requests[0].body['parallel_tool_calls'], false);
    assert.deepEqual(
        (requests[0].body['tools'] as { name: string }[]).map((tool) => tool.name),
        ['snapshot', 'query', 'act']
    );
    assert.doesNotMatch(JSON.stringify(requests[0].body), /not-a-real-key/);
    assert.doesNotMatch(JSON.stringify(backend.configuration), /not-a-real-key/);
});

test('provider errors are sanitized and never retried invisibly', async () => {
    let requests = 0;
    const fetchMock: typeof fetch = async () => {
        requests++;
        return new Response(
            JSON.stringify({ error: { message: 'Bearer not-a-real-key', type: 'authentication_error' } }),
            { status: 401, headers: { 'content-type': 'application/json' } }
        );
    };
    const backend = openAIBackend({ apiKey: 'not-a-real-key', model: 'fixture-model' }, { fetch: fetchMock });
    await assert.rejects(backend.respond([], 'Instructions.', new AbortController().signal), (error: unknown) => {
        assert.ok(error instanceof RunFailure);
        assert.equal(error.reason, 'provider-error');
        assert.match(error.message, /HTTP 401/);
        assert.doesNotMatch(error.message, /not-a-real-key/);
        return true;
    });
    assert.equal(requests, 1);
});

test('incomplete output is not recorded as completion', async () => {
    const fetchMock: typeof fetch = async () =>
        new Response(JSON.stringify({ status: 'incomplete', output: [] }), {
            headers: { 'content-type': 'application/json' }
        });
    const backend = openAIBackend({ apiKey: 'not-a-real-key', model: 'fixture-model' }, { fetch: fetchMock });
    await assert.rejects(backend.respond([], 'Instructions.', new AbortController().signal), /incomplete/);
});
