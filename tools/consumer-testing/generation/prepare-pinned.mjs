import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveCodex } from '../../codex/executable.ts';
import { sha, treeDigest } from '../environment.mjs';
import { codingConfig, configArguments } from './codex-config.mjs';
import { runLogged } from './commands.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../../..');
const first = path.join(root, 'dist/consumer-generation/2026-11-15-first');
const id = process.argv[2] ?? '2026-11-15-third';
assert.match(id, /^[a-z\d-]+$/);
const pointer = path.join(root, `dist/consumer-generation/${id}.json`);
assert.ok(!existsSync(pointer), 'This attempt ID has already been prepared; do not replace it.');
const previous = JSON.parse(readFileSync(path.join(first, 'preparation.json'), 'utf8'));
const frozen = JSON.parse(readFileSync(path.join(first, 'frozen-checks.json'), 'utf8'));
assert.equal(JSON.parse(readFileSync(path.join(first, 'report.json'), 'utf8')).status, 'infrastructure-failed');
assert.equal(previous.bundle.matchedRevision, 'd000174e3fb69ef5424b73492d73f34b84e3c80f');
for (const file of ['prompt.md', 'criteria.json', 'generation.spec.ts', 'playwright.config.ts', 'probe-app.txt'])
    assert.equal(sha(readFileSync(path.join(directory, file))), frozen[file], `${file}: first-attempt input changed`);
assert.deepEqual(treeDigest(path.join(first, 'scaffold')), previous.scaffold);
const output = realpathSync(mkdtempSync(path.join(tmpdir(), `radix-generation-${id}-`)));
const consumer = path.join(output, 'consumer');
const report = {
    attemptId: id,
    startedAt: new Date().toISOString(),
    output,
    consumer,
    firstArchive: first,
    firstArchiveDigest: treeDigest(first),
    previousArchives: Object.fromEntries(
        ['2026-11-15-first', '2026-11-15-second'].map((name) => [
            name,
            treeDigest(path.join(root, 'dist/consumer-generation', name))
        ])
    ),
    commands: [],
    liveSessions: 0
};
const save = () => writeFileSync(path.join(output, 'preparation.json'), JSON.stringify(report, null, 2) + '\n');
writeFileSync(pointer, JSON.stringify({ attemptId: id, output, consumer }, null, 2) + '\n');
console.log(`Pinned attempt ${id}: ${output}`);
async function run(label, command, args, cwd = consumer, env = process.env) {
    const result = await runLogged(label, command, args, {
        cwd,
        env,
        output,
        commands: report.commands,
        checkpoint: save
    });
    console.log(`Passed: ${label}`);
    return result.text;
}
try {
    const codex = resolveCodex();
    report.codex = codex;
    writeFileSync(path.join(output, 'codex-executable.json'), JSON.stringify(codex, null, 2) + '\n');
    cpSync(path.join(first, 'scaffold'), consumer, { recursive: true });
    cpSync(path.join(first, 'scaffold'), path.join(output, 'scaffold'), { recursive: true });
    const archive = 'radix-ng-primitives-1.3.0.tgz';
    assert.equal(sha(readFileSync(path.join(first, archive))), previous.library.tarballSha256);
    cpSync(path.join(first, archive), path.join(output, archive));
    report.scaffold = treeDigest(consumer);
    report.bundle = {
        ...previous.bundle,
        installation:
            'Reused immutable installed snapshot from the first documented GitHub installation; no latest-HEAD lookup.'
    };
    for (const [name, expected] of Object.entries(report.bundle.skills))
        assert.equal(treeDigest(path.join(consumer, '.agents/skills', name)).sha256, expected.sha256);
    report.protectedFiles = previous.protectedFiles;
    for (const [file, expected] of Object.entries(report.protectedFiles))
        assert.equal(sha(readFileSync(path.join(consumer, file))), expected);
    report.node = process.version;
    report.pnpm = execFileSync('pnpm', ['--version'], { encoding: 'utf8' }).trim();
    assert.equal(report.node, previous.node);
    assert.equal(report.pnpm, previous.pnpm);
    await run('install', 'pnpm', ['install', '--frozen-lockfile'], consumer, {
        ...process.env,
        NG_CLI_ANALYTICS: 'false'
    });
    const json = (file) => JSON.parse(readFileSync(path.join(consumer, file), 'utf8'));
    report.angular = json('node_modules/@angular/core/package.json').version;
    report.typescript = json('node_modules/typescript/package.json').version;
    report.playwright = json('node_modules/@playwright/test/package.json').version;
    for (const name of ['angular', 'typescript', 'playwright']) assert.equal(report[name], previous[name]);
    const installed = realpathSync(path.join(consumer, 'node_modules/@radix-ng/primitives'));
    assert.ok(installed.startsWith(consumer + path.sep));
    report.library = { ...previous.library, resolvedPath: installed };
    assert.equal(json('node_modules/@radix-ng/primitives/package.json').version, previous.library.version);
    const contractEnv = { ...process.env, RUN_CODEX_CODING_CONTRACT: '1' };
    await run(
        'offline-coding-contract',
        process.execPath,
        ['--test', path.join(directory, 'codex-contract.test.mjs')],
        root,
        contractEnv
    );
    mkdirSync(path.join(consumer, '.agent-tmp'), { recursive: true });
    const config = codingConfig(consumer, codex);
    writeFileSync(path.join(output, 'coding-config-preflight.json'), JSON.stringify(config, null, 2) + '\n');
    const script = `const fs=require('node:fs'); const assert=require('node:assert/strict');
for(const name of ['radix-ng','radix-ng-examples']) assert.ok(fs.readFileSync('.agents/skills/'+name+'/SKILL.md','utf8').length>0);
for(const file of ${JSON.stringify([path.join(root, 'AGENTS.md'), path.join(directory, 'generation.spec.ts'), path.join(first, 'report.json')])}) assert.throws(()=>fs.readFileSync(file),e=>['EPERM','EACCES'].includes(e.code));
console.log('Both installed skills readable; workspace and hidden checks denied.');`;
    await run('context-isolation-preflight', codex.executable, [
        'sandbox',
        '--permission-profile',
        'consumer',
        '-C',
        consumer,
        ...configArguments(config),
        '--',
        process.execPath,
        '-e',
        script
    ]);
    await run(
        'strict-compiler-preflight',
        codex.executable,
        [
            'sandbox',
            '--permission-profile',
            'consumer',
            '-C',
            consumer,
            ...configArguments(config),
            '--',
            '/bin/bash',
            '--noprofile',
            '--norc',
            '-c',
            'pnpm exec ngc -p tsconfig.app.json --noEmit'
        ],
        consumer,
        { HOME: process.env.HOME, PATH: process.env.PATH, ...config['shell_environment_policy.set'] }
    );
    await run('scaffold-git-init', 'git', ['init', '-q']);
    await run('scaffold-git-add', 'git', ['add', '.']);
    await run('scaffold-git-commit', 'git', [
        '-c',
        'user.name=Radix NG experiment',
        '-c',
        'user.email=experiment@localhost',
        'commit',
        '-qm',
        'Pinned blank consumer scaffold'
    ]);
    report.scaffoldCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: consumer, encoding: 'utf8' }).trim();
    assert.deepEqual(treeDigest(first), report.firstArchiveDigest);
    report.status = 'prepared';
} catch (error) {
    report.status = 'infrastructure-failed';
    report.error = String(error);
    process.exitCode = 1;
} finally {
    report.finishedAt = new Date().toISOString();
    save();
    console.log(`Preparation status: ${report.status}`);
}
