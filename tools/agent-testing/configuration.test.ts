import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { artifactWriter } from './artifacts.ts';
import { browserEnvironment, configuration } from './run.ts';

test('configuration requires an explicit task/scenario and model; secrets come only from the chosen environment variable', () => {
    assert.throws(() => configuration(['--task', 'Rename.', '--model', 'test'], {}), /No live run was performed/);
    assert.throws(() => configuration(['--task', 'Rename.', '--scenario', 'all'], {}), /exactly one/);
    assert.throws(() => configuration(['--scenario', 'missing'], {}), /Unknown scenario/);
    const config = configuration(['--scenario', 'rename', '--api-key-env', 'TEST_KEY'], {
        TEST_KEY: 'test-secret',
        OPENAI_MODEL: 'test-model'
    });
    assert.ok('apiKey' in config);
    assert.equal(config.apiKey, 'test-secret');
    assert.ok('display' in configuration(['--help'], {}));
});

test('configuration rejects remote pages, credentials in the page URL and invalid limits', () => {
    const env = { OPENAI_API_KEY: 'test-secret', OPENAI_MODEL: 'test-model' };
    for (const url of ['https://example.com', 'file:///tmp/site', 'http://key@localhost', 'http://localhost/path'])
        assert.throws(() => configuration(['--task', 'Rename.', '--base-url', url], env), /loopback/);
    for (const value of ['0', '-1', '1.5', 'Infinity', '100000'])
        assert.throws(() => configuration(['--task', 'Rename.', `--max-steps=${value}`], env), /Invalid/);
});

test('browser environment never inherits the provider credential or unrelated secrets', () => {
    const env = browserEnvironment({
        PATH: '/bin',
        HOME: '/example',
        OPENAI_API_KEY: 'secret',
        MY_KEY: 'secret',
        TOKEN: 'secret'
    });
    assert.deepEqual(env, { PATH: '/bin', HOME: '/example' });
});

test('evidence serialization redacts secrets in task text, model output and nested tool results', () => {
    const root = mkdtempSync(join(tmpdir(), 'radix-agent-artifacts-'));
    try {
        const escapedSecret = 'test-"secret\\with\nnewlines';
        const writer = artifactWriter(root, 'test', ['test-secret', escapedSecret]);
        writer.json('report.json', { task: 'test-secret', output: { data: `prefix ${escapedSecret} suffix` } });
        writer.event({ result: escapedSecret });
        for (const file of ['report.json', 'events.jsonl']) {
            const content = readFileSync(join(writer.directory, file), 'utf8');
            assert.doesNotMatch(content, /test-secret/);
            assert.doesNotMatch(content, /secret/);
            assert.match(content, /REDACTED/);
            JSON.parse(content);
        }
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
