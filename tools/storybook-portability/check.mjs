/** Build the documented standalone examples against an installed tarball, outside the workspace. */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { dependencies, portableStoryGroups, stylesheet, workspaceRoot } from './sources.mjs';

const directory = process.env.RADIX_PORTABLE_DIR ?? mkdtempSync(path.join(os.tmpdir(), 'radix-storybook-portable-'));
const read = (file) => readFileSync(path.join(workspaceRoot, file), 'utf8');
const rootPackage = JSON.parse(read('package.json'));
const groups = portableStoryGroups();
const entries = [...new Set(groups.flatMap((group) => group.sources))];
const files = [...new Set(entries.flatMap((file) => [...dependencies(file)]))];
const log = path.join(directory, 'verification.log');
const commands = [];
function run(args, cwd = directory) {
    const result = spawnSync('pnpm', args, {
        cwd,
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
        env: { ...process.env, CI: '1' }
    });
    writeFileSync(log, `\n$ pnpm ${args.join(' ')}\n${result.stdout ?? ''}${result.stderr ?? ''}`, { flag: 'a' });
    commands.push({ args, status: result.status });
    if (result.status !== 0) throw new Error(`pnpm ${args.join(' ')} failed; see ${log}`);
}
mkdirSync(directory, { recursive: true });
if (!existsSync(path.join(workspaceRoot, 'dist/primitives/package.json'))) run(['primitives:build'], workspaceRoot);
if (!existsSync(path.join(directory, 'package.json'))) {
    cpSync(path.join(workspaceRoot, 'tools/consumer-testing/fixture'), directory, { recursive: true });
    rmSync(path.join(directory, 'src'), { recursive: true, force: true });
}
const manifest = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8'));
manifest.name = 'radix-storybook-portability-check';
for (const file of files)
    for (const match of read(file).matchAll(/from\s*['"]([^.'"][^'"]+)['"]/g)) {
        const specifier = match[1];
        const name = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
        if (name === '@radix-ng/primitives') continue;
        const version = rootPackage.dependencies?.[name] ?? rootPackage.devDependencies?.[name];
        if (version) manifest.dependencies[name] = version;
    }
for (const name of ['@floating-ui/dom', '@internationalized/date', '@internationalized/number'])
    manifest.dependencies[name] = rootPackage.dependencies[name];
for (const name of ['tailwindcss', '@tailwindcss/postcss', 'postcss']) {
    manifest.devDependencies[name] = rootPackage.devDependencies[name] ?? rootPackage.dependencies[name] ?? '^8.5.6';
}
run(['pack', '--pack-destination', directory], path.join(workspaceRoot, 'dist/primitives'));
const tarball = readdirSync(directory).find((file) => file.endsWith('.tgz'));
manifest.dependencies['@radix-ng/primitives'] = `file:./${tarball}`;
writeFileSync(path.join(directory, 'package.json'), JSON.stringify(manifest, null, 2));
cpSync(
    path.join(workspaceRoot, 'tools/consumer-testing/fixture/pnpm-workspace.yaml'),
    path.join(directory, 'pnpm-workspace.yaml')
);
run(['install', '--no-frozen-lockfile']);
const copyRoot = path.join(directory, 'src/examples');
rmSync(copyRoot, { recursive: true, force: true });
for (const file of files) {
    if (/\.\.\/src\/|storybook\/styles/.test(read(file))) throw new Error(`Internal implementation import in ${file}`);
    const target = path.join(copyRoot, file);
    mkdirSync(path.dirname(target), { recursive: true });
    cpSync(path.join(workspaceRoot, file), target);
}
mkdirSync(path.join(directory, 'src'), { recursive: true });
cpSync(path.join(workspaceRoot, stylesheet), path.join(directory, 'src/demo-styles.css'));
writeFileSync(path.join(directory, '.postcssrc.json'), JSON.stringify({ plugins: { '@tailwindcss/postcss': {} } }));
writeFileSync(path.join(directory, 'src/styles.css'), "@import 'tailwindcss';\n@import './demo-styles.css';\n");
writeFileSync(
    path.join(directory, 'src/index.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="/"><title>Portable demos</title></head><body><portable-app></portable-app></body></html>'
);
writeFileSync(
    path.join(directory, 'src/main.ts'),
    `import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ButtonDefaultStory } from './examples/packages/primitives/button/stories/button-default-example';
import { InputDefaultStory } from './examples/packages/primitives/input/stories/input-default-example';
import { RdxPopoverDefaultComponent } from './examples/packages/primitives/popover/stories/popover-default';
import { SelectTypedWrapper } from './examples/packages/primitives/select/stories/select-typed-wrapper';
@Component({selector:'portable-app',imports:[ButtonDefaultStory,InputDefaultStory,RdxPopoverDefaultComponent,SelectTypedWrapper],template:\`<div class="grid gap-8 p-8"><rdx-button-default-example/><rdx-input-default-example/><rdx-popover-default/><select-typed-wrapper/></div>\`})
class App {}
bootstrapApplication(App).catch(console.error);
`
);
console.log(`External consumer: ${directory}`);
console.log(
    `AOT inputs: ${entries.length} examples, ${files.length - entries.length} dependencies; Angular ${manifest.dependencies['@angular/core']}, Tailwind ${manifest.devDependencies.tailwindcss}`
);
try {
    run(['build']);
    const probe = path.join(directory, 'src/published-array-probe.ts');
    writeFileSync(
        probe,
        `import { Component } from '@angular/core';
import { popoverImports } from '@radix-ng/primitives/popover';
@Component({selector:'published-array-probe',imports:[...popoverImports],template:'<div rdxPopoverRoot></div>'})
export class PublishedArrayProbe {}
`
    );
    let rejectedPublishedArray;
    try {
        const args = ['exec', 'ngc', '-p', 'tsconfig.app.json', '--noEmit'];
        const result = spawnSync('pnpm', args, { cwd: directory, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
        const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
        writeFileSync(log, `\n$ pnpm ${args.join(' ')} (expected NG1010)\n${output}`, { flag: 'a' });
        rejectedPublishedArray = result.status !== 0 && /NG1010/.test(output);
        if (!rejectedPublishedArray) throw new Error('AOT check did not reject the published-array probe.');
        commands.push({ args, status: result.status, expected: 'NG1010' });
    } finally {
        rmSync(probe, { force: true });
    }
    const tsconfig = JSON.parse(readFileSync(path.join(directory, 'tsconfig.json'), 'utf8'));
    if (tsconfig.compilerOptions.paths || tsconfig.extends)
        throw new Error('External build must not use workspace aliases.');
    const report = {
        directory,
        packageVersion: JSON.parse(read('packages/primitives/package.json')).version,
        entries,
        files,
        stylesheet,
        dependencies: manifest.dependencies,
        devDependencies: manifest.devDependencies,
        commands,
        rejectedPublishedArray,
        aot: 'passed'
    };
    writeFileSync(path.join(directory, 'report.json'), JSON.stringify(report, null, 2));
    if (process.env.RADIX_PORTABLE_RECORD) {
        const installedVersion = (name) =>
            JSON.parse(readFileSync(path.join(directory, 'node_modules', name, 'package.json'), 'utf8')).version;
        const fingerprint = (file) => ({
            path: file,
            sha256: createHash('sha256')
                .update(readFileSync(path.join(workspaceRoot, file)))
                .digest('hex')
        });
        const record = {
            aot: 'passed',
            packageVersion: installedVersion('@radix-ng/primitives'),
            angularVersion: installedVersion('@angular/core'),
            tailwindVersion: installedVersion('tailwindcss'),
            workspaceAliases: false,
            rejectedPublishedArray,
            examples: entries.length,
            dependencies: files.length - entries.length,
            stylesheet: fingerprint(stylesheet),
            files: files
                .sort()
                .map((file) => ({ ...fingerprint(file), kind: entries.includes(file) ? 'example' : 'dependency' }))
        };
        writeFileSync(
            path.resolve(workspaceRoot, process.env.RADIX_PORTABLE_RECORD),
            `${JSON.stringify(record, null, 4)}\n`
        );
    }
    console.log(`AOT passed. Evidence: ${path.join(directory, 'report.json')}`);
} catch (error) {
    writeFileSync(
        path.join(directory, 'report.json'),
        JSON.stringify({ directory, entries, files, commands, aot: 'failed' }, null, 2)
    );
    throw error;
}
