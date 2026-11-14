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
    readdirSync,
    realpathSync,
    writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = realpathSync(mkdtempSync(path.join(tmpdir(), 'radix-consumer-')));
const consumer = path.join(output, 'consumer');
const json = (file) => JSON.parse(readFileSync(file, 'utf8'));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const report = { startedAt: new Date().toISOString(), output, node: process.version, commands: [] };
const saveReport = () => writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');

function treeDigest(directory) {
    const files = readdirSync(directory, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)))
        .sort();
    const hash = createHash('sha256');
    for (const file of files)
        hash.update(file)
            .update('\0')
            .update(readFileSync(path.join(directory, file)))
            .update('\0');
    return { files: files.length, sha256: hash.digest('hex') };
}

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
    const installer = ['dlx', 'skills@1.8.1', 'add', 'radix-ng/primitives/skills'];
    const discovery = await pnpm('skills-discovery', [...installer, '--list'], consumer);
    assert.match(discovery, /Found 2 skills/, 'the consumer subpath must offer only two skills');
    await pnpm('skills-install', [...installer, '--agent', 'codex', '--yes', '--copy'], consumer);
    const lock = json(path.join(consumer, 'skills-lock.json'));
    assert.deepEqual(Object.keys(lock.skills).sort(), ['radix-ng', 'radix-ng-examples']);
    const source = 'https://github.com/radix-ng/primitives.git';
    const published = path.join(output, 'published-source');
    await run('published-source', 'git', ['clone', '--depth', '1', source, published]);
    const revision = await run('published-revision', 'git', ['rev-parse', 'HEAD'], published);
    const skillRoot = path.join(consumer, '.agents/skills');
    const skills = {};
    for (const name of Object.keys(lock.skills)) {
        const installed = treeDigest(path.join(skillRoot, name));
        assert.deepEqual(
            installed,
            treeDigest(path.join(published, 'skills', name)),
            `${name}: installed bytes differ from the captured published revision; retry if HEAD moved`
        );
        skills[name] = {
            ...installed,
            matchesLocalBundle: installed.sha256 === treeDigest(path.join(root, 'skills', name)).sha256
        };
    }
    report.bundle = { source, subpath: 'skills', matchedRevision: revision, installer: 'skills@1.8.1', skills };

    // Keep the packed library and its dependencies physically outside the workspace.
    await pnpm('library-build', ['primitives:build']);
    await pnpm('library-pack', ['pack', '--pack-destination', output], path.join(root, 'dist/primitives'));
    const archive = readdirSync(output).find((file) => file.endsWith('.tgz'));
    assert.ok(archive, 'pnpm pack did not produce a tarball');
    const manifestPath = path.join(consumer, 'package.json');
    const manifest = json(manifestPath);
    manifest.dependencies['@radix-ng/primitives'] = `file:../${archive}`;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    await pnpm('consumer-install', ['install'], consumer);
    const installedRoot = realpathSync(path.join(consumer, 'node_modules/@radix-ng/primitives'));
    assert.ok(installedRoot.startsWith(consumer + path.sep), 'library resolution escaped the isolated consumer');
    const library = json(path.join(installedRoot, 'package.json'));
    report.library = {
        version: library.version,
        tarballSha256: sha(readFileSync(path.join(output, archive))),
        resolvedPath: installedRoot
    };
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
            matchesLibrary: api.version === library.version && styling.version === library.version
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
    const inputs = Object.keys(json(path.join(consumer, 'dist/consumer/stats.json')).inputs);
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
