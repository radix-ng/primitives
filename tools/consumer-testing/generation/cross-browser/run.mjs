import { chromium, firefox, webkit } from '@playwright/test';
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
import { desktopBrowserProjects } from '../../../playwright/browser-projects.mts';
import { sha, treeDigest } from '../../environment.mjs';
import { runLogged } from '../commands.mjs';
import { adaptChecks } from './checks.mjs';
import { captureTask, loadTasks, playwrightPackages, readJson, validateTask } from './inputs.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const generation = path.dirname(directory);
const workspace = path.resolve(directory, '../../../..');
const id = process.argv[2] ?? '2026-11-15-cross-browser-v1';
assert.match(id, /^[a-z\d-]+$/);
const mirror = path.join(workspace, 'dist/consumer-generation', id);
assert.ok(!existsSync(mirror), 'Keep each matrix result; choose a new ID instead of overwriting.');
const output = realpathSync(mkdtempSync(path.join(tmpdir(), `radix-${id}-`)));
const tasks = loadTasks(workspace);
const histories = () =>
    Object.fromEntries(
        readdirSync(path.dirname(mirror), { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && entry.name !== id)
            .map(({ name }) => [name, treeDigest(path.join(path.dirname(mirror), name))])
    );
const report = {
    id,
    mode: 'cross-browser-reevaluation',
    checksVersion: 'consumer-browser-matrix/2',
    startedAt: new Date().toISOString(),
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: workspace }).trim(),
    node: process.version,
    platform: process.platform,
    additionalLiveSessions: 0,
    sourceCorrections: [],
    output,
    mirror: path.relative(workspace, mirror),
    status: 'preparing',
    commands: [],
    browsers: {},
    before: {},
    assertions: []
};
const save = () => writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
const run = (label, command, args, cwd, env = process.env, allowFailure = false) =>
    runLogged(label, command, args, { cwd, env, output, commands: report.commands, checkpoint: save, allowFailure });
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
save();
try {
    report.historiesBefore = histories();
    report.runnerPackages = playwrightPackages(workspace);
    console.log('Hashing both retained source trees and complete dependency contents/symlinks...');
    report.before = Object.fromEntries(tasks.map((task) => [task.name, captureTask(task)]));
    mkdirSync(path.join(output, 'checks'));
    symlinkSync(path.join(workspace, 'node_modules'), path.join(output, 'checks/node_modules'), 'dir');
    cpSync(path.join(directory, 'keyboard.ts'), path.join(output, 'checks/keyboard.ts'));
    report.harnessHashes = Object.fromEntries(
        readdirSync(directory)
            .filter((name) => /\.(mjs|ts)$/.test(name))
            .map((name) => [name, sha(readFileSync(path.join(directory, name)))])
    );
    mkdirSync(path.join(output, 'harness'));
    const projectHelper = path.join(workspace, 'tools/playwright/browser-projects.mts');
    report.projectHelper = { file: path.relative(workspace, projectHelper), sha256: sha(readFileSync(projectHelper)) };
    cpSync(projectHelper, path.join(output, 'harness/browser-projects.mts'));
    for (const file of Object.keys(report.harnessHashes))
        cpSync(path.join(directory, file), path.join(output, 'harness', file));
    for (const task of tasks) {
        check(`${task.name}: original source, package, skills and frozen checks`, () => {
            validateTask(task, report.before[task.name], generation);
            assert.deepEqual(playwrightPackages(task.consumer), report.runnerPackages);
        });
        const original = readFileSync(path.join(generation, task.checks), 'utf8');
        writeFileSync(path.join(output, `checks/${task.name}.original.txt`), original);
        writeFileSync(
            path.join(output, `checks/${task.name}.spec.ts`),
            adaptChecks(original, task.offset, {
                explicitCheckboxOrigin: task.name === 'select'
            })
        );
        for (const variant of ['app', 'probe']) {
            const target = path.join(output, `${task.name}-${variant}`);
            cpSync(path.join(task.archive, 'generated'), target, {
                recursive: true,
                filter: (file) => path.basename(file) !== '.agents'
            });
            if (variant === 'probe') cpSync(path.join(generation, task.parent), path.join(target, 'src/app/app.ts'));
            symlinkSync(path.join(task.consumer, 'node_modules'), path.join(target, 'node_modules'), 'dir');
            await run(
                `${task.name}-${variant}-production-build`,
                process.execPath,
                [
                    path.join(task.consumer, 'node_modules/@angular/cli/bin/ng.js'),
                    'build',
                    '--configuration',
                    'production',
                    '--stats-json'
                ],
                target,
                { ...process.env, NG_CLI_ANALYTICS: 'false' }
            );
            check(`${task.name}-${variant}: unchanged component and isolated build inputs`, () => {
                const file = task.name === 'select' ? 'src/app/app-select.ts' : 'src/app/app-email-field.ts';
                assert.equal(sha(readFileSync(path.join(target, file))), report.before[task.name].sourceFiles[file]);
                if (variant === 'app')
                    assert.deepEqual(treeDigest(path.join(target, 'src')), report.before[task.name].source);
                for (const input of Object.keys(readJson(path.join(target, 'dist/consumer/stats.json')).inputs)) {
                    const file = path.resolve(target, input);
                    if (existsSync(file)) assert.ok(!realpathSync(file).startsWith(workspace + path.sep), input);
                }
            });
        }
    }
    report.checkHashes = Object.fromEntries(
        ['keyboard.ts', 'select.spec.ts', 'email.spec.ts'].map((name) => [
            name,
            sha(readFileSync(path.join(output, 'checks', name)))
        ])
    );
    for (const project of desktopBrowserProjects(output)) {
        let browser;
        try {
            browser = await { chromium, firefox, webkit }[project.name].launch(project.use?.launchOptions);
            report.browsers[project.name] = {
                version: browser.version(),
                executable: { chromium, firefox, webkit }[project.name].executablePath()
            };
        } catch (error) {
            report.browsers[project.name] = { error: String(error) };
            throw error;
        } finally {
            await browser?.close();
            save();
        }
    }
    report.status = 'running';
    save();
    console.log(`Running 12 scenarios across ${Object.keys(report.browsers).join(', ')}...`);
    const browserCheck = await run(
        'browser-matrix',
        process.execPath,
        [
            path.join(workspace, 'node_modules/@playwright/test/cli.js'),
            'test',
            '-c',
            path.join(directory, 'playwright.config.ts')
        ],
        workspace,
        { ...process.env, RADIX_MATRIX_DIR: output },
        true
    );
    report.browserStats = readJson(path.join(output, 'browser-results.json')).stats;
    const cases = [];
    function collect(suites) {
        for (const suite of suites) {
            for (const spec of suite.specs)
                for (const test of spec.tests) {
                    const result = test.results.at(-1);
                    cases.push({
                        project: test.projectName,
                        host: suite.title,
                        title: spec.title,
                        status: result.status,
                        durationMs: result.duration,
                        errors: result.errors,
                        trace: result.attachments
                            .filter((item) => item.name === 'trace')
                            .map((item) => path.relative(output, item.path))
                    });
                }
            collect(suite.suites ?? []);
        }
    }
    collect(readJson(path.join(output, 'browser-results.json')).suites);
    report.cases = cases;
    check('complete 36-case matrix without retries/skips', () => {
        assert.equal(cases.length, 36);
        assert.ok(cases.every((item) => ['passed', 'failed', 'timedOut'].includes(item.status)));
    });
    report.status =
        browserCheck.code === 0 && cases.every((item) => item.status === 'passed') ? 'passed' : 'browser-checks-failed';
} catch (error) {
    report.status = 'infrastructure-failed';
    report.error = String(error);
} finally {
    report.after = Object.fromEntries(tasks.map((task) => [task.name, captureTask(task)]));
    try {
        check('retained sources, entire dependencies, skills and historical archives unchanged', () => {
            assert.deepEqual(report.after, report.before);
            assert.deepEqual(histories(), report.historiesBefore);
        });
    } catch (error) {
        report.status = 'integrity-failed';
        report.integrityError = String(error);
    }
    report.finishedAt = new Date().toISOString();
    save();
    const caseKey = (item) => `${item.project.split('-')[0]}: ${item.host}: ${item.title}`;
    const rows = [...new Set((report.cases ?? []).map(caseKey))].map((key) => {
        return `| ${key} | ${['chromium', 'firefox', 'webkit']
            .map((engine) => {
                const item = report.cases.find((item) => caseKey(item) === key && item.project.endsWith(`-${engine}`));
                return item ? `[${item.status}](${item.trace[0]})` : 'not run';
            })
            .join(' | ')} |`;
    });
    writeFileSync(
        path.join(output, 'matrix.md'),
        `# ${id}\n\nStatus: ${report.status}. No new generation or source repairs.\n\n` +
            `| Engine | Version |\n| --- | --- |\n${Object.entries(report.browsers)
                .map(([name, value]) => `| ${name} | ${value.version ?? value.error} |`)
                .join('\n')}\n\n` +
            `| Scenario | Chromium | Firefox | WebKit |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`
    );
    cpSync(output, mirror, {
        recursive: true,
        filter: (file) => !['node_modules', '.angular'].includes(path.basename(file))
    });
}
console.log(
    JSON.stringify(
        { id, status: report.status, output, mirror, stats: report.browserStats, error: report.error },
        null,
        2
    )
);
if (report.status !== 'passed') process.exitCode = 1;
