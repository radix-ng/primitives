import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { codexEnvironment, resolveCodex } from '../../codex/executable.ts';
import { codingConfig, configArguments, disabledFeatures } from './codex-config.mjs';

test('coding configuration keeps the tool host enabled and denies fixture/source access', () => {
    const consumer = path.join(tmpdir(), 'radix-contract', 'consumer');
    const config = codingConfig(consumer, { executable: process.execPath, version: 'codex-cli 0.169.0' });
    assert.equal(config['features.code_mode_host'], true);
    assert.ok(!disabledFeatures.includes('code_mode_host'));
    assert.equal(config['permissions.consumer.filesystem'][path.dirname(consumer)], 'deny');
    assert.equal(config['permissions.consumer.filesystem'][consumer], 'write');
});

test(
    'offline CLI fixture executes a real coding tool without contacting a model',
    {
        skip: process.env.RUN_CODEX_CODING_CONTRACT !== '1',
        timeout: 25000
    },
    async () => {
        const codex = resolveCodex();
        const output = mkdtempSync(path.join(tmpdir(), 'radix-coding-contract-'));
        const consumer = path.join(output, 'consumer');
        mkdirSync(path.join(consumer, '.agent-tmp'), { recursive: true });
        const requests = [];
        const marker = 'OFFLINE_CODING_TOOL_EXECUTED';
        const command = `${JSON.stringify(process.execPath)} -e ${"'"}require("node:fs").writeFileSync(".agent-tmp/marker", "${marker}"); console.log("${marker}")${"'"}`;
        const call = {
            type: 'function_call',
            id: 'fc_offline',
            call_id: 'offline-call',
            name: 'exec_command',
            arguments: JSON.stringify({ cmd: command, login: false, yield_time_ms: 1000 })
        };
        const message = {
            type: 'message',
            id: 'msg_offline',
            role: 'assistant',
            content: [{ type: 'output_text', text: 'Offline fixture completed.', annotations: [] }]
        };
        const server = createServer(async (request, response) => {
            if (request.url !== '/responses') {
                response.writeHead(404, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: { message: 'Offline fixture endpoint.' } }));
                return;
            }
            let raw = '';
            for await (const chunk of request) raw += chunk;
            requests.push({ body: JSON.parse(raw), authorization: Boolean(request.headers.authorization) });
            response.writeHead(200, { 'Content-Type': 'text/event-stream' });
            const item = requests.length === 1 ? call : message;
            const send = (type, data) =>
                response.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`);
            send('response.created', { response: { id: `resp_${requests.length}`, status: 'in_progress' } });
            send('response.output_item.added', { output_index: 0, item });
            send('response.output_item.done', { output_index: 0, item });
            send('response.completed', {
                response: {
                    id: `resp_${requests.length}`,
                    status: 'completed',
                    output: [item],
                    usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 }
                }
            });
            response.end();
        });
        let child;
        let timer;
        try {
            await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
            const config = codingConfig(consumer, codex);
            delete config.forced_login_method;
            Object.assign(config, {
                model_provider: 'fixture',
                'model_providers.fixture': {
                    name: 'fixture',
                    base_url: `http://127.0.0.1:${server.address().port}`,
                    wire_api: 'responses',
                    requires_openai_auth: false,
                    request_max_retries: 0,
                    stream_max_retries: 0
                },
                'features.enable_request_compression': false
            });
            // No API-key variables; the fixture never requests or receives subscription credentials.
            // Regression: the real CLI's directory is deliberately absent from child PATH.
            const env = { ...codexEnvironment(), PATH: config['shell_environment_policy.set'].PATH };
            child = spawn(
                codex.executable,
                [
                    'exec',
                    '--skip-git-repo-check',
                    '--ignore-user-config',
                    '--ignore-rules',
                    '--ephemeral',
                    '--json',
                    '--model',
                    'fixture',
                    '-C',
                    consumer,
                    '--enable',
                    'skip_host_skill_discovery',
                    ...disabledFeatures.flatMap((feature) => ['--disable', feature]),
                    ...configArguments(config),
                    '-'
                ],
                { cwd: consumer, env, stdio: ['pipe', 'pipe', 'pipe'], detached: true }
            );
            let log = '';
            for (const stream of [child.stdout, child.stderr]) stream.on('data', (chunk) => (log += chunk));
            child.stdin.end('Offline transport fixture.');
            timer = setTimeout(() => {
                try {
                    process.kill(-child.pid, 'SIGKILL');
                } catch {
                    /* Exited. */
                }
            }, 20000);
            const code = await new Promise((resolve) => child.on('close', resolve));
            assert.equal(code, 0, log.slice(-4000));
            assert.equal(readFileSync(path.join(consumer, '.agent-tmp/marker'), 'utf8'), marker);
            assert.equal(requests.length, 2);
            assert.ok(requests[0].body.tools.some((tool) => tool.name === 'exec_command'));
            assert.ok(JSON.stringify(requests[1].body.input).includes(marker));
            assert.ok(requests.every((request) => !request.authorization));
            assert.ok(!log.includes('code-mode host is disabled'));
        } finally {
            clearTimeout(timer);
            if (child?.pid && child.exitCode === null && child.signalCode === null) {
                try {
                    process.kill(-child.pid, 'SIGKILL');
                } catch {
                    /* Exited. */
                }
                await new Promise((resolve) => child.once('close', resolve));
            }
            server.closeAllConnections();
            await new Promise((resolve) => server.close(resolve));
            rmSync(output, { recursive: true, force: true });
        }
    }
);
