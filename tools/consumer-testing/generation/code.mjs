import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { codexEnvironment, resolveCodex } from '../../codex/executable.ts';
import { sha } from '../environment.mjs';
import { codingConfig, configArguments, disabledFeatures } from './codex-config.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
assert.ok(process.argv[2], 'Pass the prepared external consumer directory.');
const consumer = path.resolve(process.argv[2]);
const output = path.dirname(consumer);
const runPath = path.join(output, 'coding-run.json');
assert.ok(!existsSync(runPath), 'One run only: this consumer already has a coding-run record.');
const preparation = JSON.parse(readFileSync(path.join(output, 'preparation.json'), 'utf8'));
assert.equal(preparation.status, 'prepared', 'Complete offline preparation before a live session.');
const codex = resolveCodex();
writeFileSync(path.join(output, 'codex-executable.json'), JSON.stringify(codex, null, 2) + '\n');
// Exercise the actual coding tool router with a local fake provider before spending subscription usage.
const contract = spawnSync(process.execPath, ['--test', path.join(directory, 'codex-contract.test.mjs')], {
    env: { ...process.env, RUN_CODEX_CODING_CONTRACT: '1' },
    encoding: 'utf8',
    timeout: 30000
});
writeFileSync(path.join(output, 'coding-tool-preflight.log'), (contract.stdout ?? '') + (contract.stderr ?? ''));
assert.equal(contract.status, 0, 'Offline coding-tool contract failed; no live session was started.');
const login = spawnSync(codex.executable, ['login', 'status'], {
    env: codexEnvironment(),
    encoding: 'utf8',
    timeout: 10000
});
writeFileSync(
    path.join(output, 'authorization.json'),
    JSON.stringify(
        {
            executable: codex.executable,
            version: codex.version,
            exitCode: login.status,
            spawnError: login.error ? { code: login.error.code, message: login.error.message } : null,
            message: login.stdout + login.stderr
        },
        null,
        2
    ) + '\n'
);
assert.equal(login.status, 0);
assert.match(login.stdout + login.stderr, /Logged in using ChatGPT/);
const config = codingConfig(consumer, codex);
mkdirSync(path.join(consumer, '.agent-tmp'), { recursive: true });
const files = [
    'prompt.md',
    'criteria.json',
    'generation.spec.ts',
    'playwright.config.ts',
    'probe-app.txt',
    'codex-config.mjs',
    'code.mjs',
    'codex-contract.test.mjs'
];
const frozen = Object.fromEntries(files.map((file) => [file, sha(readFileSync(path.join(directory, file)))]));
mkdirSync(path.join(output, 'frozen-inputs'), { recursive: true });
for (const file of files)
    writeFileSync(path.join(output, 'frozen-inputs', file), readFileSync(path.join(directory, file)));
writeFileSync(
    path.join(output, 'codex-executable-source.ts'),
    readFileSync(path.join(directory, '../../codex/executable.ts'))
);
const prompt = readFileSync(path.join(directory, 'prompt.md'), 'utf8');
for (const file of ['prompt.md', 'criteria.json'])
    writeFileSync(path.join(output, file), readFileSync(path.join(directory, file)));
writeFileSync(path.join(output, 'frozen-checks.json'), JSON.stringify(frozen, null, 2) + '\n');
const args = [
    'exec',
    '--ignore-user-config',
    '--ignore-rules',
    '--ephemeral',
    '--json',
    '--model',
    'gpt-6.1-sol',
    '-C',
    consumer,
    '--output-last-message',
    path.join(output, 'final-answer.md'),
    '--enable',
    'skip_host_skill_discovery',
    ...disabledFeatures.flatMap((feature) => ['--disable', feature]),
    ...configArguments(config),
    '-'
];
const environment = codexEnvironment();
const record = {
    mode: 'live-coding',
    attemptId: preparation.attemptId ?? path.basename(output),
    provider: 'codex',
    authentication: 'chatgpt',
    model: 'gpt-6.1-sol',
    reasoningEffort: 'low',
    codexVersion: codex.version,
    codexExecutable: codex.executable,
    startedAt: new Date().toISOString(),
    consumer,
    config,
    args,
    frozenChecks: frozen,
    sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: directory }).trim(),
    sourcePatchSha256: sha(execFileSync('git', ['diff', '--binary', 'HEAD'], { cwd: directory })),
    maximumDurationMs: 900_000,
    maximumCommands: 80,
    commands: 0,
    usage: null,
    reason: 'running'
};
const save = () => writeFileSync(runPath, JSON.stringify(record, null, 2) + '\n');
save();
const child = spawn(codex.executable, args, {
    cwd: consumer,
    env: environment,
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: true
});
let pending = '';
let killTimer;
const stop = (reason) => {
    if (record.reason !== 'running') return;
    record.reason = reason;
    save();
    try {
        process.kill(-child.pid, 'SIGINT');
    } catch {
        /* Already exited. */
    }
    killTimer = setTimeout(() => {
        try {
            process.kill(-child.pid, 'SIGKILL');
        } catch {
            /* Already exited. */
        }
    }, 3000);
};
const timer = setTimeout(() => stop('time-limit'), record.maximumDurationMs);
const interrupt = () => stop('user-interruption');
process.once('SIGINT', interrupt);
const event = (line) => {
    if (!line.trim()) return;
    const item = JSON.parse(line);
    if (item.type === 'item.started' && item.item?.type === 'command_execution') {
        record.commands++;
        if (record.commands > record.maximumCommands) stop('command-limit');
        console.log(`Coding command ${record.commands}: ${item.item.command?.slice(0, 160)}`);
    }
    if (item.type === 'turn.completed') record.usage = item.usage ?? null;
    if (item.type === 'turn.failed' || item.type === 'error')
        record.providerError = item.error ?? item.message ?? item.type;
};
child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
    appendFileSync(path.join(output, 'journal.jsonl'), chunk);
    pending += chunk;
    const lines = pending.split('\n');
    pending = lines.pop();
    for (const line of lines) {
        try {
            event(line);
        } catch {
            stop('invalid-journal');
        }
    }
});
child.stderr.on('data', (chunk) => appendFileSync(path.join(output, 'codex-stderr.log'), chunk));
child.stdin.on('error', () => {});
child.on('error', (error) => {
    record.startError = { code: error.code ?? null, message: error.message };
    appendFileSync(
        path.join(output, 'codex-stderr.log'),
        `Process launch failed: ${error.code ?? error.name}: ${error.message}\n`
    );
});
child.stdin.end(prompt);
child.on('close', (code, signal) => {
    clearTimeout(timer);
    clearTimeout(killTimer);
    process.removeListener('SIGINT', interrupt);
    if (pending.trim()) {
        try {
            event(pending);
        } catch {
            record.reason = 'invalid-journal';
        }
    }
    record.exitCode = code;
    record.signal = signal;
    if (record.reason === 'running') record.reason = code === 0 ? 'completed' : 'provider-or-executor-error';
    record.finishedAt = new Date().toISOString();
    record.durationMs = Date.now() - Date.parse(record.startedAt);
    save();
    console.log(
        JSON.stringify({ reason: record.reason, commands: record.commands, durationMs: record.durationMs, output })
    );
    process.exitCode = code === 0 && record.reason === 'completed' ? 0 : 1;
});
