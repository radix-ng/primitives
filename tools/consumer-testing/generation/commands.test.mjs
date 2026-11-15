import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runLogged } from './commands.mjs';

test('spawn errors are written to both the command log and structured record', async () => {
    const output = mkdtempSync(path.join(tmpdir(), 'codex-command-'));
    try {
        const commands = [];
        await assert.rejects(
            runLogged('missing-cli', path.join(output, 'absent-codex'), [], { cwd: output, output, commands }),
            /missing-cli: ENOENT/
        );
        const record = JSON.parse(readFileSync(path.join(output, 'missing-cli.json'), 'utf8'));
        assert.equal(record.spawnError.code, 'ENOENT');
        assert.ok(record.finishedAt);
        assert.match(readFileSync(path.join(output, 'missing-cli.log'), 'utf8'), /Process launch failed: ENOENT/);
        assert.equal(commands.length, 1);
    } finally {
        rmSync(output, { recursive: true, force: true });
    }
});
