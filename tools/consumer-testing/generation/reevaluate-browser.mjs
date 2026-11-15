import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
    cpSync,
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    realpathSync,
    symlinkSync,
    writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha, treeDigest } from '../environment.mjs';
import { runLogged } from './commands.mjs';

// Offline reevaluation only: no coding launcher or model/provider is invoked.
const checksVersion = 'appselect-consumer/2';
const directory = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(directory, '../../..');
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const pointer = readJson(path.resolve(process.argv[2] ?? 'dist/consumer-generation/2026-11-15-third.json'));
const consumer = realpathSync(pointer.consumer);
const attemptId = pointer.attemptId;
assert.ok(!consumer.startsWith(workspace + path.sep), 'Use the retained external consumer.');
const archive = path.join(workspace, 'dist/consumer-generation', attemptId);
const preparation = readJson(path.join(archive, 'preparation.json'));
const reevaluationId = process.argv[3] ?? `${attemptId}-reevaluation-v2`;
assert.match(reevaluationId, /^[a-zA-Z0-9_-]+$/, 'Use a simple, separate reevaluation ID.');
const mirror = path.join(workspace, 'dist/consumer-generation', reevaluationId);
assert.ok(!existsSync(mirror), 'Retain previous results; use a new reevaluation ID.');
const output = realpathSync(mkdtempSync(path.join(tmpdir(), 'radix-reevaluation-v2-')));
const report = {
    reevaluationId,
    originalAttemptId: attemptId,
    checksVersion,
    status: 'verifying',
    startedAt: new Date().toISOString(),
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: workspace, encoding: 'utf8' }).trim(),
    additionalLiveSessions: 0,
    sourceCorrections: [],
    externalEvidence: output,
    mirror: path.relative(workspace, mirror),
    consumer,
    commands: [],
    assertions: []
};
const save = () => writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
const run = (label, executable, args, cwd = workspace, env = process.env) =>
    runLogged(label, executable, args, { cwd, env, output, commands: report.commands, checkpoint: save });
function check(name, action) {
    try {
        action();
        report.assertions.push({ name, passed: true });
    } catch (error) {
        report.assertions.push({ name, passed: false, message: String(error) });
        throw error;
    } finally {
        save();
    }
}
function captureInputs() {
    const source = path.join(consumer, 'src');
    return {
        source: treeDigest(source),
        sourceFiles: Object.fromEntries(
            readdirSync(source, { recursive: true, withFileTypes: true })
                .filter((entry) => entry.isFile())
                .map((entry) => path.join(entry.parentPath, entry.name))
                .sort()
                .map((file) => [path.relative(consumer, file), sha(readFileSync(file))])
        ),
        library: treeDigest(realpathSync(path.join(consumer, 'node_modules/@radix-ng/primitives'))),
        skills: Object.fromEntries(
            Object.keys(preparation.bundle.skills).map((name) => [
                name,
                treeDigest(path.join(consumer, '.agents/skills', name))
            ])
        ),
        protectedFiles: Object.fromEntries(
            Object.keys(preparation.protectedFiles).map((file) => [file, sha(readFileSync(path.join(consumer, file)))])
        ),
        histories: Object.fromEntries(
            [...Object.keys(preparation.previousArchives), attemptId].map((id) => [
                id,
                treeDigest(path.join(workspace, 'dist/consumer-generation', id))
            ])
        ),
        frozenChecks: Object.fromEntries(
            ['prompt.md', 'criteria.json', 'generation.spec.ts', 'playwright.config.ts', 'probe-app.txt'].map(
                (file) => [file, sha(readFileSync(path.join(directory, file)))]
            )
        )
    };
}
save();
try {
    report.before = captureInputs();
    check('retained source, installed dependencies/skills and original checks match third attempt', () => {
        assert.deepEqual(report.before.source, treeDigest(path.join(archive, 'generated/src')));
        assert.deepEqual(report.before.library, readJson(path.join(archive, 'package-integrity.json')).expected);
        assert.deepEqual(report.before.protectedFiles, preparation.protectedFiles);
        for (const [name, digest] of Object.entries(report.before.skills))
            assert.equal(digest.sha256, preparation.bundle.skills[name].sha256);
        const frozen = readJson(path.join(archive, 'frozen-checks.json'));
        for (const [file, digest] of Object.entries(report.before.frozenChecks))
            assert.equal(digest, frozen[file], file);
    });
    const checks = [
        'generation-v2.spec.ts',
        'playwright.reevaluation.config.ts',
        'probe-app-v2.txt',
        'reevaluate-browser.mjs'
    ];
    report.checkHashes = Object.fromEntries(
        checks.map((file) => [file, sha(readFileSync(path.join(directory, file)))])
    );
    mkdirSync(path.join(output, 'checks'));
    for (const file of checks) cpSync(path.join(directory, file), path.join(output, 'checks', file));
    cpSync(path.join(archive, 'generated/src'), path.join(output, 'generated-src'), { recursive: true });
    const pnpmVersion = await run('pnpm-version', 'pnpm', ['--version']);
    const browser = await chromium.launch();
    try {
        report.versions = {
            node: process.version,
            pnpm: pnpmVersion.text,
            playwright: readJson(path.join(workspace, 'node_modules/@playwright/test/package.json')).version,
            chromium: browser.version(),
            angular: readJson(path.join(consumer, 'node_modules/@angular/core/package.json')).version,
            typescript: readJson(path.join(consumer, 'node_modules/typescript/package.json')).version,
            library: preparation.library.version,
            bundleRevision: preparation.bundle.matchedRevision
        };
    } finally {
        await browser.close();
    }
    for (const name of ['application', 'probe']) {
        const target = path.join(output, name);
        cpSync(path.join(archive, 'generated'), target, {
            recursive: true,
            filter: (file) => path.basename(file) !== '.agents'
        });
        if (name === 'probe') cpSync(path.join(output, 'checks/probe-app-v2.txt'), path.join(target, 'src/app/app.ts'));
        symlinkSync(path.join(consumer, 'node_modules'), path.join(target, 'node_modules'), 'dir');
        await run(
            `${name}-production-build`,
            process.execPath,
            [
                path.join(consumer, 'node_modules/@angular/cli/bin/ng.js'),
                'build',
                '--configuration',
                'production',
                '--stats-json'
            ],
            target,
            { ...process.env, NG_CLI_ANALYTICS: 'false' }
        );
        check(`${name} uses unchanged component and isolated build inputs`, () => {
            assert.equal(
                sha(readFileSync(path.join(target, 'src/app/app-select.ts'))),
                report.before.sourceFiles['src/app/app-select.ts']
            );
            if (name === 'application') assert.deepEqual(treeDigest(path.join(target, 'src')), report.before.source);
            const stats = readJson(path.join(target, 'dist/consumer/stats.json'));
            for (const input of Object.keys(stats.inputs)) {
                const file = path.resolve(target, input);
                if (existsSync(file)) assert.ok(!realpathSync(file).startsWith(workspace + path.sep), input);
            }
        });
    }
    // Capture a nonzero test exit as a result rather than losing its browser artifacts.
    const browserCheck = await runLogged(
        'four-browser-scenarios-v2',
        'pnpm',
        ['exec', 'playwright', 'test', '-c', 'tools/consumer-testing/generation/playwright.reevaluation.config.ts'],
        {
            cwd: workspace,
            env: { ...process.env, RADIX_GENERATION_REEVALUATION_DIR: output },
            output,
            commands: report.commands,
            checkpoint: save,
            allowFailure: true
        }
    );
    report.browserStats = readJson(path.join(output, 'browser-results.json')).stats;
    check('four corrected Chromium scenarios', () => {
        assert.equal(browserCheck.code, 0);
        assert.equal(report.browserStats.expected, 4);
        assert.equal(report.browserStats.unexpected, 0);
        assert.equal(report.browserStats.skipped, 0);
    });
    report.status = 'passed';
} catch (error) {
    report.status = report.browserStats ? 'browser-checks-failed' : 'infrastructure-failed';
    report.error = String(error);
} finally {
    try {
        report.after = captureInputs();
        check('consumer, library, skills and all historical archives/checks remain unchanged', () =>
            assert.deepEqual(report.after, report.before)
        );
    } catch (error) {
        report.status = 'integrity-failed';
        report.integrityError = String(error);
    }
    report.finishedAt = new Date().toISOString();
    report.durationMs = Date.parse(report.finishedAt) - Date.parse(report.startedAt);
    save();
    cpSync(output, mirror, {
        recursive: true,
        filter: (file) => !['node_modules', '.angular'].includes(path.basename(file))
    });
}
console.log(JSON.stringify({ status: report.status, output, mirror, browserStats: report.browserStats }, null, 2));
if (report.status !== 'passed') process.exitCode = 1;
