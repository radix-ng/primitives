import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { prepareReference } from './reference.ts';

test('reference uses committed objects, reuses verified cache offline, and rejects tampering', () => {
    const root = mkdtempSync(join(tmpdir(), 'radix-parity-reference-'));
    try {
        const source = join(root, 'source');
        const cacheRoot = join(root, 'cache');
        mkdirSync(join(source, 'packages/react'), { recursive: true });
        writeFileSync(join(source, 'packages/react/package.json'), '{"version":"1.9.0"}');
        const file = join(source, 'packages/react/fixture.ts');
        writeFileSync(file, 'export const committed = true;');
        const git = (...args: string[]) =>
            execFileSync('git', ['-C', source, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
        git('init');
        git('add', '.');
        git('-c', 'user.name=Parity test', '-c', 'user.email=parity@example.invalid', 'commit', '-m', 'fixture');
        const spec = {
            repository: source,
            commit: git('rev-parse', 'HEAD'),
            packageVersion: '1.9.0',
            paths: ['packages/react']
        };
        writeFileSync(file, 'uncommitted working tree');
        const prepared = prepareReference({ source, cacheRoot, spec });
        const cachedFile = join(prepared.directory, 'packages/react/fixture.ts');
        assert.equal(readFileSync(cachedFile, 'utf8'), 'export const committed = true;');
        assert.equal(readFileSync(file, 'utf8'), 'uncommitted working tree');
        rmSync(source, { recursive: true });
        assert.deepEqual(prepareReference({ source, cacheRoot, spec }), prepared);
        writeFileSync(cachedFile, 'tampered');
        assert.throws(() => prepareReference({ source, cacheRoot, spec }), /reference cache changed/);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('fresh cache can fetch the pinned object without a checkout', () => {
    const root = mkdtempSync(join(tmpdir(), 'radix-parity-fetch-'));
    try {
        const source = join(root, 'source');
        mkdirSync(join(source, 'packages/react'), { recursive: true });
        writeFileSync(join(source, 'packages/react/package.json'), '{"version":"1.9.0"}');
        const git = (...args: string[]) =>
            execFileSync('git', ['-C', source, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
        git('init');
        git('add', '.');
        git('-c', 'user.name=Parity test', '-c', 'user.email=parity@example.invalid', 'commit', '-m', 'fixture');
        const spec = {
            repository: source,
            commit: git('rev-parse', 'HEAD'),
            packageVersion: '1.9.0',
            paths: ['packages/react']
        };
        const prepared = prepareReference({ source: '', cacheRoot: join(root, 'cache'), spec });
        assert.equal(prepared.commit, spec.commit);
        assert.equal(prepared.packageVersion, '1.9.0');
        assert.throws(
            () =>
                prepareReference({
                    source,
                    cacheRoot: join(root, 'wrong-version'),
                    spec: { ...spec, packageVersion: '0.0.0' }
                }),
            /Unexpected reference package version/
        );
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
