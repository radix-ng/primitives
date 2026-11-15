import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { packageDigest, playwrightPackages } from './inputs.mjs';

test('Playwright dependencies resolve through their owning package without top-level aliases', () => {
    const workspace = path.resolve(import.meta.dirname, '../../../..');
    const fixture = mkdtempSync(path.join(tmpdir(), 'radix-browser-dependency-test-'));
    try {
        mkdirSync(path.join(fixture, 'node_modules/@playwright'), { recursive: true });
        writeFileSync(path.join(fixture, 'package.json'), '{}');
        symlinkSync(
            realpathSync(path.join(workspace, 'node_modules/@playwright/test')),
            path.join(fixture, 'node_modules/@playwright/test'),
            'dir'
        );
        assert.throws(
            () => createRequire(path.join(fixture, 'package.json')).resolve('playwright/package.json'),
            /Cannot find module/
        );
        assert.deepEqual(playwrightPackages(fixture), playwrightPackages(workspace));
    } finally {
        rmSync(fixture, { recursive: true, force: true });
    }
});

test('package identity ignores installation shims while detecting runtime-code changes', () => {
    const fixture = mkdtempSync(path.join(tmpdir(), 'radix-package-hash-test-'));
    try {
        writeFileSync(path.join(fixture, 'index.js'), 'export const value = 1;');
        const initial = packageDigest(fixture);
        mkdirSync(path.join(fixture, 'node_modules/.bin'), { recursive: true });
        writeFileSync(path.join(fixture, 'node_modules/.bin/playwright'), '/absolute/installation/path');
        assert.deepEqual(packageDigest(fixture), initial);
        writeFileSync(path.join(fixture, 'index.js'), 'export const value = 2;');
        assert.notDeepEqual(packageDigest(fixture), initial);
    } finally {
        rmSync(fixture, { recursive: true, force: true });
    }
});
