import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { codexArguments, codexBackend, codexEnvironment, createCodexProcess, type CodexProcess } from './codex.ts';
import { runAgent } from './loop.ts';
import { configuration } from './run.ts';
import { RunFailure } from './types.ts';

function fixture(exec: CodexProcess, auth = 'Logged in using ChatGPT'): CodexProcess {
    return async (request) => {
        if (request.args[0] === '--version') return { stdout: 'codex-cli 0.169.0\n', stderr: '' };
        if (request.args[0] === 'login') return { stdout: '', stderr: auth + '\n' };
        return exec(request);
    };
}

test('Codex configuration uses its own model selection and does not require or retain an API key', () => {
    const config = configuration(['--provider', 'codex', '--scenario', 'rename'], {
        CODEX_MODEL: 'codex-model',
        OPENAI_MODEL: 'api-model',
        OPENAI_API_KEY: 'must-not-be-used'
    });
    assert.ok('provider' in config);
    assert.equal(config.provider, 'codex');
    assert.equal(config.model, 'codex-model');
    assert.equal(config.apiKey, undefined);
    assert.equal(Object.hasOwn(config, 'maxOutputTokens'), false);
    assert.equal(config.limits.requestTimeoutMs, 60_000);
    assert.equal(config.limits.totalTimeoutMs, 300_000);
    assert.throws(
        () => configuration(['--provider', 'codex', '--task', 'Read'], { OPENAI_MODEL: 'api-model' }),
        /CODEX_MODEL/
    );
    for (const extra of [
        ['--api-key-env', 'KEY'],
        ['--max-output-tokens', '100']
    ])
        assert.throws(
            () => configuration(['--provider', 'codex', '--task', 'Read', '--model', 'codex', ...extra], {}),
            /does not accept/
        );
    assert.throws(() => configuration(['--provider', 'typo', '--task', 'Read'], {}), /Choose --provider/);
});

test('Codex preserves the auth location but drops API credentials, endpoint overrides and parent thread context', () => {
    assert.deepEqual(
        codexEnvironment({
            PATH: '/bin',
            HOME: '/home/user',
            CODEX_HOME: '/auth',
            OPENAI_API_KEY: 'secret',
            CODEX_API_KEY: 'secret',
            OPENAI_BASE_URL: 'https://other',
            CODEX_ACCESS_TOKEN: 'secret',
            CODEX_THREAD_ID: 'parent',
            SECRET: 'secret'
        }),
        { PATH: '/bin', HOME: '/home/user', CODEX_HOME: '/auth' }
    );
});

test('API-key or missing login fails preflight without starting a model or changing credentials', async () => {
    for (const auth of ['Logged in using an API key', 'Not logged in']) {
        let executed = false;
        await assert.rejects(
            codexBackend(
                { model: 'test' },
                fixture(async () => {
                    executed = true;
                    return { stdout: '', stderr: '' };
                }, auth)
            ),
            /signed in with ChatGPT/
        );
        assert.equal(executed, false);
    }
    await assert.rejects(
        codexBackend({ model: 'test' }, async () => ({ stdout: 'codex-cli 0.100.0', stderr: '' })),
        /0.169.0/
    );
});

test('JSON decisions travel through the existing loop, validators and observed-ID gate; temporary files are removed', async () => {
    let directory = '';
    let calls = 0;
    let value = 'Original';
    const input = () => ({
        id: 'discovered',
        kind: 'input',
        name: 'Project name',
        available: true,
        disabled: false,
        value,
        actions: ['set-value']
    });
    const execute = fixture(async (request) => {
        directory = request.cwd!;
        const payload = JSON.parse(request.input!);
        assert.deepEqual(
            payload.tools.map((tool: { name: string }) => tool.name),
            ['snapshot', 'query', 'act']
        );
        assert.deepEqual(JSON.parse(await readFile(join(directory, 'schema.json'), 'utf8')).required, [
            'kind',
            'tool',
            'arguments',
            'text'
        ]);
        assert.ok(request.args.includes('--ignore-user-config'));
        assert.ok(request.args.includes('forced_login_method="chatgpt"'));
        const last = payload.transcript.at(-1);
        const decision =
            calls++ === 0
                ? { kind: 'tool', tool: 'snapshot', arguments: '{}', text: '' }
                : calls === 2
                  ? {
                        kind: 'tool',
                        tool: 'act',
                        arguments: JSON.stringify({
                            id: JSON.parse(last.output).controls[0].id,
                            action: 'set-value',
                            value: 'Updated'
                        }),
                        text: ''
                    }
                  : { kind: 'final', tool: null, arguments: '{}', text: 'Updated the project.' };
        if (calls === 3) assert.equal(JSON.parse(last.output).after.value, 'Updated');
        await writeFile(join(directory, 'decision.json'), JSON.stringify(decision));
        request.onLine?.(
            JSON.stringify({ type: 'item.completed', item: { type: 'error', message: 'CLI diagnostic' } })
        );
        request.onLine?.(JSON.stringify({ type: 'turn.completed', usage: { input_tokens: 10, output_tokens: 5 } }));
        return { stdout: '', stderr: 'ignored diagnostic with a secret' };
    });
    const backend = await codexBackend({ model: 'fixture' }, execute);
    const run = await runAgent({
        task: 'Update the project.',
        backend,
        bridge: {
            async check() {},
            async call(name, args) {
                if (name === 'snapshot') return { controls: [input()] };
                const before = input();
                value = (args as { value: string }).value;
                return { status: 'applied', message: 'Applied.', before, after: input() };
            }
        }
    });
    assert.equal(run.reason, 'completed');
    assert.equal(run.finalSnapshot?.controls[0].value, 'Updated');
    assert.equal(run.configuration.authentication, 'chatgpt');
    assert.equal(run.toolCalls, 2);
    assert.equal(run.usage.length, 3);
    assert.doesNotMatch(JSON.stringify(run), /secret/);
    await assert.rejects(access(directory));
});

test('native tool execution and malformed decisions fail before reaching the runtime', async () => {
    for (const decision of [
        'not JSON',
        JSON.stringify({ kind: 'tool', tool: 'shell', arguments: '{}', text: '' }),
        JSON.stringify({ kind: 'final', tool: 'act', arguments: '{}', text: 'Done.' }),
        JSON.stringify({ kind: 'tool', tool: 'snapshot', arguments: '{}', text: 'Done.' }),
        'native-tool'
    ]) {
        let directory = '';
        const backend = await codexBackend(
            { model: 'fixture' },
            fixture(async (request) => {
                directory = request.cwd!;
                if (decision === 'native-tool')
                    request.onLine?.(JSON.stringify({ type: 'item.started', item: { type: 'command_execution' } }));
                await writeFile(join(directory, 'decision.json'), decision);
                return { stdout: '', stderr: '' };
            })
        );
        await assert.rejects(backend.respond([], 'Instructions.', new AbortController().signal), RunFailure);
        await assert.rejects(access(directory));
    }
});

test('provider errors and interruption remove temporary decisions without exposing CLI diagnostics', async () => {
    for (const event of [
        { type: 'error' },
        { type: 'turn.failed' },
        { type: 'item.updated', item: { type: 'mcp_tool_call' } }
    ]) {
        let directory = '';
        const backend = await codexBackend(
            { model: 'fixture' },
            fixture(async (request) => {
                directory = request.cwd!;
                request.onLine?.(JSON.stringify({ ...event, message: 'sensitive' }));
                return { stdout: '', stderr: '' };
            })
        );
        await assert.rejects(backend.respond([], 'Instructions.', new AbortController().signal), (error: unknown) => {
            assert.ok(error instanceof RunFailure);
            assert.equal(error.reason, event.type === 'item.updated' ? 'invalid-tool' : 'provider-error');
            assert.doesNotMatch(error.message, /sensitive/);
            return true;
        });
        await assert.rejects(access(directory));
    }
    const abort = new AbortController();
    let started = false;
    const pending = codexBackend({ model: 'fixture', signal: abort.signal }, async ({ signal }) => {
        started = true;
        await new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
        return { stdout: '', stderr: '' };
    });
    abort.abort(new RunFailure('aborted', 'Interrupted.'));
    await assert.rejects(pending, (error: unknown) => error instanceof RunFailure && error.reason === 'aborted');
    assert.equal(started, true);
});

test('Codex arguments carry instructions as data, outside the user transcript', () => {
    const instruction = 'Data with "quotes", $() and `backticks`\nSecond line.';
    const args = codexArguments({ model: 'fixture', directory: '/tmp/path with spaces', instructions: instruction });
    assert.ok(args.includes('/tmp/path with spaces/schema.json'));
    const setting = args.find((arg) => arg.startsWith('developer_instructions='))!;
    assert.ok(JSON.parse(setting.slice(setting.indexOf('=') + 1)).startsWith(instruction));
});

test('the owned CLI process is terminated on abort and nonzero stderr is sanitized', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'radix-fake-codex-'));
    const executable = join(directory, 'codex');
    try {
        await writeFile(
            executable,
            `#!${process.execPath}\nconsole.log(JSON.stringify({pid:process.pid}));\nsetInterval(()=>{},1000);\n`,
            { mode: 0o700 }
        );
        const abort = new AbortController();
        let pid = 0;
        const pending = createCodexProcess(executable)({
            args: [],
            signal: abort.signal,
            onLine(line) {
                pid = JSON.parse(line).pid;
                abort.abort(new RunFailure('request-timeout', 'Timeout.'));
            }
        });
        await assert.rejects(
            pending,
            (error: unknown) => error instanceof RunFailure && error.reason === 'request-timeout'
        );
        assert.ok(pid > 0);
        assert.throws(() => process.kill(pid, 0));
        await writeFile(
            executable,
            `#!${process.execPath}\nconsole.error('sensitive-provider-diagnostic');\nprocess.exit(1);\n`,
            { mode: 0o700 }
        );
        await assert.rejects(
            createCodexProcess(executable)({ args: [], signal: new AbortController().signal }),
            (error: unknown) => {
                assert.ok(error instanceof RunFailure);
                assert.doesNotMatch(error.message, /sensitive-provider-diagnostic/);
                return true;
            }
        );
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});
