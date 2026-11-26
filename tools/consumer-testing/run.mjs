import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
    closeSync,
    cpSync,
    existsSync,
    mkdtempSync,
    openSync,
    readFileSync,
    realpathSync,
    writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserBuildInputs, installConsumerSkills, installPackedLibrary, treeDigest } from './environment.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = realpathSync(mkdtempSync(path.join(tmpdir(), 'radix-consumer-')));
const consumer = path.join(output, 'consumer');
const json = (file) => JSON.parse(readFileSync(file, 'utf8'));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const report = { startedAt: new Date().toISOString(), output, node: process.version, commands: [] };
const saveReport = () => writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');

async function run(label, command, args, cwd = root, extraEnv = {}) {
    console.log(`Consumer check: ${label}`);
    const log = path.join(output, `${label}.log`);
    const fd = openSync(log, 'w');
    const step = { label, command, args, cwd, log };
    report.commands.push(step);
    try {
        step.code = await new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                cwd,
                env: { ...process.env, DISABLE_TELEMETRY: '1', NG_CLI_ANALYTICS: 'false', ...extraEnv },
                stdio: ['ignore', fd, fd]
            });
            child.on('error', reject);
            child.on('exit', (code) => resolve(code));
        });
    } finally {
        closeSync(fd);
        saveReport();
    }
    const text = readFileSync(log, 'utf8');
    assert.equal(step.code, 0, `${label} failed; see ${log}\n${text.slice(-5000)}`);
    return text.trim();
}

const pnpm = (label, args, directory = root, env = {}) => run(label, 'pnpm', ['--dir', directory, ...args], root, env);

async function main() {
    assert.equal(process.versions.node.split('.')[0], readFileSync(path.join(root, '.nvmrc'), 'utf8').trim());
    report.pnpm = await pnpm('pnpm-version', ['--version']);
    report.gitHead = await run('local-revision', 'git', ['rev-parse', 'HEAD']);
    report.librarySourceDiffSha256 = sha(
        await run('library-source-diff', 'git', ['diff', 'HEAD', '--', 'packages/primitives'])
    );
    cpSync(path.join(root, 'tools/consumer-testing/fixture'), consumer, { recursive: true });
    report.fixture = treeDigest(consumer);

    // Exercise the documented GitHub subpath with a pinned installer, in project scope only.
    report.bundle = await installConsumerSkills({ root, consumer, output, pnpm, run });
    const skillRoot = path.join(consumer, '.agents/skills');

    // Keep the packed library and its dependencies physically outside the workspace.
    report.library = await installPackedLibrary({ root, consumer, output, pnpm });
    report.angular = json(path.join(consumer, 'node_modules/@angular/core/package.json')).version;
    report.typescript = json(path.join(consumer, 'node_modules/typescript/package.json')).version;
    report.consumerLockSha256 = sha(readFileSync(path.join(consumer, 'pnpm-lock.yaml')));

    const contracts = ['field', 'select', 'dialog', 'menu', 'tabs'];
    report.context = contracts.map((slug) => {
        const api = json(path.join(skillRoot, `radix-ng/references/api-contract/${slug}.json`));
        const styling = json(path.join(skillRoot, `radix-ng/references/styling-contract/${slug}.json`));
        return {
            slug,
            apiVersion: api.version,
            stylingVersion: styling.version,
            matchesLibrary: api.version === report.library.version && styling.version === report.library.version
        };
    });
    report.examples = [
        'field--reactive-forms',
        'select--focus-management',
        'menu--open-dialog',
        'tabs--projected-through-a-wrapper'
    ].map((name) => {
        const file = `radix-ng-examples/references/examples/${name}.md`;
        return { file, sha256: sha(readFileSync(path.join(skillRoot, file))) };
    });
    await pnpm('consumer-build', ['build'], consumer);
    const inputs = browserBuildInputs(consumer);
    for (const input of inputs) {
        const file = path.resolve(consumer, input);
        if (existsSync(file))
            assert.ok(
                !realpathSync(file).startsWith(root + path.sep),
                `consumer build imported workspace file: ${input}`
            );
    }
    const libraryInputs = inputs.filter((input) => input.includes('/@radix-ng/primitives/'));
    assert.ok(libraryInputs.length, 'build statistics did not include the installed library');
    report.isolation = { strictTemplates: true, noWorkspaceInputs: true, libraryInputs };
    report.playwright = json(path.join(root, 'node_modules/@playwright/test/package.json')).version;
    report.browserSpecSha256 = sha(readFileSync(path.join(root, 'tools/consumer-testing/consumer.spec.ts')));
    await pnpm(
        'consumer-browser',
        ['exec', 'playwright', 'test', '-c', 'tools/consumer-testing/playwright.config.ts', ...process.argv.slice(2)],
        root,
        { RADIX_CONSUMER_DIR: consumer }
    );
    report.browser = json(path.join(output, 'browser-results.json')).stats;
    report.status = 'passed';
}

console.log(`Consumer evidence: ${output}`);
try {
    await main();
} catch (error) {
    report.status = 'failed';
    report.error = String(error);
    console.error(error);
    process.exitCode = 1;
} finally {
    report.finishedAt = new Date().toISOString();
    saveReport();
    console.log(`Consumer report: ${path.join(output, 'report.json')}`);
}
