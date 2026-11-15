import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, readlinkSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { sha, treeDigest } from '../../environment.mjs';

export const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
export function loadTasks(workspace) {
    const root = path.join(workspace, 'dist/consumer-generation');
    return [
        {
            name: 'select',
            id: '2026-11-15-third',
            checks: 'generation-v2.spec.ts',
            parent: 'probe-app-v2.txt',
            offset: 0,
            checksRecord: readJson(path.join(root, '2026-11-15-third-reevaluation-v2/report.json')).checkHashes
        },
        {
            name: 'email',
            id: '2026-11-15-email-field-first',
            checks: 'email-field/generation.spec.ts',
            parent: 'email-field/probe-app.txt',
            offset: 2
        }
    ].map((task) => {
        const pointer = readJson(path.join(root, `${task.id}.json`));
        const archive = path.join(root, task.id);
        const preparation = readJson(path.join(archive, 'preparation.json'));
        const consumer = realpathSync(pointer.consumer);
        assert.ok(!consumer.startsWith(workspace + path.sep));
        return { ...task, consumer, archive, preparation };
    });
}

function dependencies(directory) {
    const links = readdirSync(directory, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isSymbolicLink())
        .map((entry) => path.join(entry.parentPath, entry.name))
        .sort()
        .map((file) => [path.relative(directory, file), readlinkSync(file)]);
    return { contents: treeDigest(directory), symlinks: { count: links.length, sha256: sha(JSON.stringify(links)) } };
}

export function captureTask(task) {
    const { consumer, preparation } = task;
    return {
        source: treeDigest(path.join(consumer, 'src')),
        sourceFiles: Object.fromEntries(
            readdirSync(path.join(consumer, 'src'), { recursive: true, withFileTypes: true })
                .filter((entry) => entry.isFile())
                .map((entry) => path.join(entry.parentPath, entry.name))
                .sort()
                .map((file) => [path.relative(consumer, file), sha(readFileSync(file))])
        ),
        dependencies: dependencies(path.join(consumer, 'node_modules')),
        library: treeDigest(realpathSync(path.join(consumer, 'node_modules/@radix-ng/primitives'))),
        protectedFiles: Object.fromEntries(
            Object.keys(preparation.protectedFiles).map((file) => [file, sha(readFileSync(path.join(consumer, file)))])
        ),
        skills: Object.fromEntries(
            Object.keys(preparation.bundle.skills).map((name) => [
                name,
                treeDigest(path.join(consumer, '.agents/skills', name))
            ])
        )
    };
}

export function validateTask(task, captured, directory) {
    assert.deepEqual(captured.source, treeDigest(path.join(task.archive, 'generated/src')));
    assert.deepEqual(captured.protectedFiles, task.preparation.protectedFiles);
    const library =
        task.preparation.libraryDigest ?? readJson(path.join(task.archive, 'package-integrity.json')).expected;
    assert.deepEqual(captured.library, library);
    for (const [name, digest] of Object.entries(captured.skills))
        assert.equal(digest.sha256, task.preparation.bundle.skills[name].sha256);
    const expected = task.checksRecord ?? readJson(path.join(task.archive, 'frozen-checks.json'));
    for (const file of [task.checks, task.parent])
        assert.equal(sha(readFileSync(path.join(directory, file))), expected[path.basename(file)], file);
}

export function playwrightPackages(directory) {
    const require = createRequire(path.join(directory, 'package.json'));
    const test = require.resolve('@playwright/test/package.json');
    const playwright = createRequire(test).resolve('playwright/package.json');
    const core = createRequire(playwright).resolve('playwright-core/package.json');
    return Object.fromEntries(
        [
            ['@playwright/test', test],
            ['playwright', playwright],
            ['playwright-core', core]
        ].map(([name, file]) => [name, { version: readJson(file).version, ...packageDigest(path.dirname(file)) }])
    );
}

// Compare published package bytes across installations. pnpm's nested .bin shims embed absolute
// installation paths; complete retained node_modules (including shims) is hashed separately.
export function packageDigest(directory) {
    const files = readdirSync(directory, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)))
        .filter((file) => file.split(path.sep)[0] !== 'node_modules')
        .sort();
    const hash = createHash('sha256');
    for (const file of files)
        hash.update(file)
            .update('\0')
            .update(readFileSync(path.join(directory, file)))
            .update('\0');
    return { files: files.length, sha256: hash.digest('hex') };
}
