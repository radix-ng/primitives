import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { sha, treeDigest } from '../environment.mjs';
import { runLogged } from './commands.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(directory, '../../..');
assert.ok(process.argv[2], 'Pass an external consumer after its single coding session has ended.');
const consumer = realpathSync(process.argv[2]);
assert.ok(!consumer.startsWith(workspace + path.sep), 'Verification requires an external consumer.');
const output = path.dirname(consumer);
const json = (file) => JSON.parse(readFileSync(path.join(output, file), 'utf8'));
const preparation = json('preparation.json');
const coding = json('coding-run.json');
assert.notEqual(coding.reason, 'running');
const reportPath = path.join(output, 'report.json');
assert.ok(!existsSync(reportPath), 'Retain each verification result; do not overwrite a finished report.');
const report = {
    attemptId: preparation.attemptId,
    status: 'verifying',
    liveSessions: 1,
    model: coding.model,
    reasoningEffort: coding.reasoningEffort,
    codex: { executable: coding.codexExecutable, version: coding.codexVersion },
    usage: coding.usage,
    durationMs: coding.durationMs,
    preparation,
    codingReason: coding.reason,
    humanConsumerCodeCorrections: [],
    commands: [],
    assertions: [],
    externalEvidence: output,
    mirror: `dist/consumer-generation/${preparation.attemptId}`
};
const save = () => writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
async function check(name, action) {
    try {
        const detail = await action();
        report.assertions.push({ name, passed: true, detail });
    } catch (error) {
        report.assertions.push({ name, passed: false, message: String(error) });
    }
    save();
}
const run = (label, executable, args, cwd = consumer, env = process.env) =>
    runLogged(label, executable, args, {
        cwd,
        env,
        output,
        commands: report.commands,
        checkpoint: save,
        allowFailure: true
    });
const sourceDigest = treeDigest(path.join(consumer, 'src'));
save();
await check('historical attempts unchanged', () => {
    for (const [id, digest] of Object.entries(preparation.previousArchives)) {
        const archive = path.join(workspace, 'dist/consumer-generation', id);
        assert.deepEqual(treeDigest(archive), digest);
        assert.equal(
            JSON.parse(readFileSync(path.join(archive, 'report.json'), 'utf8')).status,
            'infrastructure-failed'
        );
    }
});
await check('task, criteria and four browser tests unchanged', () => {
    const first = JSON.parse(
        readFileSync(path.join(workspace, 'dist/consumer-generation/2026-11-15-first/frozen-checks.json'), 'utf8')
    );
    for (const file of ['prompt.md', 'criteria.json', 'generation.spec.ts', 'playwright.config.ts', 'probe-app.txt']) {
        assert.equal(sha(readFileSync(path.join(directory, file))), first[file]);
        assert.equal(coding.frozenChecks[file], first[file]);
    }
});
await check('protected dependencies, strict configuration and installed skills unchanged', () => {
    for (const [file, digest] of Object.entries(preparation.protectedFiles))
        assert.equal(sha(readFileSync(path.join(consumer, file))), digest, file);
    for (const [name, expected] of Object.entries(preparation.bundle.skills))
        assert.equal(treeDigest(path.join(consumer, '.agents/skills', name)).sha256, expected.sha256);
});
// Index metadata captures new files in the patch; consumer source is never edited by this evaluator.
execFileSync('git', ['add', '--intent-to-add', '.'], { cwd: consumer });
const patch = execFileSync('git', ['diff', '--binary', 'HEAD'], { cwd: consumer });
writeFileSync(path.join(output, 'generated.patch'), patch);
report.generatedPatchSha256 = sha(patch);
report.generatedPatchBytes = patch.length;
cpSync(consumer, path.join(output, 'generated'), {
    recursive: true,
    filter: (file) =>
        !['node_modules', 'dist', '.angular', '.agent-tmp', 'out-tsc', '.git'].includes(path.basename(file))
});
await check('AppSelect exists and primitive imports use installed public entry points', () => {
    assert.ok(existsSync(path.join(consumer, 'src/app/app-select.ts')));
    const manifest = JSON.parse(
        readFileSync(path.join(consumer, 'node_modules/@radix-ng/primitives/package.json'), 'utf8')
    );
    const imports = [];
    for (const entry of readdirSync(path.join(consumer, 'src'), { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;
        const file = path.join(entry.parentPath, entry.name);
        const parsed = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
        for (const statement of parsed.statements) {
            if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
            const specifier = statement.moduleSpecifier.text;
            assert.ok(!specifier.includes('storybook') && !path.isAbsolute(specifier), specifier);
            if (!specifier.startsWith('@radix-ng/primitives')) continue;
            const exported = '.' + specifier.slice('@radix-ng/primitives'.length);
            assert.ok(Object.hasOwn(manifest.exports, exported), `Non-public primitive import: ${specifier}`);
            imports.push({ file: path.relative(consumer, file), specifier });
        }
    }
    assert.ok(imports.some((entry) => entry.specifier === '@radix-ng/primitives/select'));
    assert.ok(imports.some((entry) => entry.specifier === '@radix-ng/primitives/dialog'));
    report.publicImports = imports;
});
const build = await run('production-build', 'pnpm', ['build'], consumer, { ...process.env, NG_CLI_ANALYTICS: 'false' });
await check('generated application production build', () => assert.equal(build.code, 0));
if (build.code === 0)
    await check('production inputs do not resolve into the workspace', () => {
        const stats = JSON.parse(readFileSync(path.join(consumer, 'dist/consumer/stats.json'), 'utf8'));
        const inputs = Object.keys(stats.inputs);
        for (const input of inputs) {
            const file = path.resolve(consumer, input);
            if (existsSync(file)) assert.ok(!realpathSync(file).startsWith(workspace + path.sep), input);
        }
        assert.ok(inputs.some((input) => input.includes('/@radix-ng/primitives/')));
        report.libraryBuildInputs = inputs.filter((input) => input.includes('/@radix-ng/primitives/'));
    });
const probe = path.join(output, 'probe');
assert.ok(!existsSync(probe), 'Do not overwrite an earlier independent host.');
cpSync(path.join(output, 'generated'), probe, { recursive: true });
writeFileSync(path.join(probe, 'src/app/app.ts'), readFileSync(path.join(output, 'frozen-inputs/probe-app.txt')));
symlinkSync(path.join(consumer, 'node_modules'), path.join(probe, 'node_modules'), 'dir');
const hostBuild = await run(
    'independent-parent-build',
    process.execPath,
    [
        path.join(consumer, 'node_modules/@angular/cli/bin/ng.js'),
        'build',
        '--configuration',
        'production',
        '--stats-json'
    ],
    probe,
    { ...process.env, NG_CLI_ANALYTICS: 'false' }
);
await check('independent parent compiles strict public bindings', () => assert.equal(hostBuild.code, 0));
if (build.code === 0 && hostBuild.code === 0) {
    const browser = await run(
        'four-browser-scenarios',
        'pnpm',
        ['exec', 'playwright', 'test', '-c', 'tools/consumer-testing/generation/playwright.config.ts'],
        workspace,
        { ...process.env, RADIX_GENERATION_DIR: consumer }
    );
    await check('four frozen Chromium scenarios', () => {
        const result = json('browser-results.json');
        report.browserStats = result.stats;
        assert.equal(browser.code, 0);
        assert.equal(result.stats.expected, 4);
        assert.equal(result.stats.unexpected, 0);
        assert.equal(result.stats.skipped, 0);
    });
} else report.browserStatus = 'not-run: production or independent-parent compilation failed';
await check('no evaluator source corrections', () =>
    assert.deepEqual(treeDigest(path.join(consumer, 'src')), sourceDigest)
);
const journal = readFileSync(path.join(output, 'journal.jsonl'), 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(JSON.parse);
const commands = journal
    .filter((event) => event.type === 'item.completed' && event.item?.type === 'command_execution')
    .map((event) => event.item);
const materials = [];
function expandedCommands(command) {
    let variants = [command];
    for (let depth = 0; depth < 8; depth++) {
        const next = variants.flatMap((text) => {
            const match = /\{([^{}]*,[^{}]*)\}/.exec(text);
            return match
                ? match[1]
                      .split(',')
                      .map((part) => text.slice(0, match.index) + part + text.slice(match.index + match[0].length))
                : [text];
        });
        if (next.length > 128 || next.every((text, index) => text === variants[index])) break;
        variants = next;
    }
    return variants;
}
for (const entry of readdirSync(path.join(consumer, '.agents/skills'), { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    const relative = path.relative(consumer, file);
    const references = commands.filter(
        (item) =>
            item.exit_code === 0 && expandedCommands(item.command ?? '').some((command) => command.includes(relative))
    );
    if (references.length)
        materials.push({
            path: relative,
            sha256: sha(readFileSync(file)),
            commandIds: references.map((item) => item.id),
            evidence: 'Referenced by successful commands; recorded command outputs remain in journal.jsonl.'
        });
}
writeFileSync(
    path.join(output, 'read-materials.json'),
    JSON.stringify(
        {
            materials,
            commands: commands.map((item) => ({
                id: item.id,
                command: item.command,
                exitCode: item.exit_code,
                outputSha256: sha(item.aggregated_output ?? '')
            })),
            limitation:
                'Command/output evidence, not a filesystem syscall audit; directory search is not proof that every matching file was read.'
        },
        null,
        2
    ) + '\n'
);
report.modelQualityEvaluated = coding.reason === 'completed';
report.status =
    coding.reason !== 'completed'
        ? 'infrastructure-failed'
        : report.assertions.every((item) => item.passed)
          ? 'passed'
          : 'verification-failed';
report.finishedAt = new Date().toISOString();
save();
cpSync(output, path.join(workspace, report.mirror), {
    recursive: true,
    filter: (file) => !['consumer', 'probe', 'published-source'].includes(path.basename(file))
});
console.log(
    JSON.stringify({
        attemptId: report.attemptId,
        status: report.status,
        browser: report.browserStats ?? report.browserStatus,
        assertions: report.assertions
    })
);
process.exitCode = report.status === 'passed' ? 0 : 1;
