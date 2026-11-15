import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { findExecutable, resolveCodex } from './executable.ts';

test(
    'resolved Codex launches after its directory is removed from child PATH',
    { skip: process.platform === 'win32' },
    () => {
        const directory = mkdtempSync(path.join(tmpdir(), 'codex-executable-'));
        try {
            const binary = path.join(directory, 'codex');
            writeFileSync(binary, '#!/bin/sh\nprintf "codex-cli 0.169.0\\n"\n');
            chmodSync(binary, 0o755);
            const codex = resolveCodex({ PATH: directory });
            assert.ok(path.isAbsolute(codex.executable));
            const restricted = { PATH: '/usr/bin:/bin' };
            assert.throws(() => findExecutable('codex', restricted), /Cannot find executable/);
            const result = spawnSync(codex.executable, ['--version'], { env: restricted, encoding: 'utf8' });
            assert.equal(result.error, undefined);
            assert.equal(result.status, 0);
            assert.equal(result.stdout.trim(), codex.version);
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    }
);

test('missing and non-executable Codex paths have actionable diagnostics', () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'codex-missing-'));
    try {
        assert.throws(() => resolveCodex({ PATH: directory }), /Cannot find executable "codex" in the parent PATH/);
        mkdirSync(path.join(directory, 'codex'));
        assert.throws(() => findExecutable('codex', { PATH: directory }), /Install Codex CLI/);
        rmSync(path.join(directory, 'codex'), { recursive: true });
        writeFileSync(path.join(directory, 'codex'), 'not executable', { mode: 0o644 });
        if (process.platform !== 'win32')
            assert.throws(() => findExecutable('codex', { PATH: directory }), /Cannot find executable/);
        assert.throws(() => findExecutable(path.join(directory, 'missing')), /provide an executable path/);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
