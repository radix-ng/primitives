import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import {
    closeSync,
    cpSync,
    mkdirSync,
    mkdtempSync,
    openSync,
    readFileSync,
    realpathSync,
    writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installConsumerSkills, installPackedLibrary, sha, treeDigest } from '../environment.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const output = realpathSync(mkdtempSync(path.join(tmpdir(), 'radix-generation-')));
const consumer = path.join(output, 'consumer');
mkdirSync(path.join(consumer, 'src/app'), { recursive: true });
const report = {
    startedAt: new Date().toISOString(),
    output,
    consumer,
    node: process.version,
    commands: [],
    liveRuns: 0
};
const save = () => writeFileSync(path.join(output, 'preparation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Generation evidence: ${output}`);
mkdirSync(path.join(root, 'dist/consumer-generation'), { recursive: true });
writeFileSync(path.join(root, 'dist/consumer-generation/latest.json'), JSON.stringify({ output, consumer }) + '\n');
async function run(label, command, args, cwd = root) {
    const log = path.join(output, `${label}.log`);
    const fd = openSync(log, 'w');
    const step = { label, command, args, cwd, log };
    report.commands.push(step);
    try {
        step.code = await new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                cwd,
                env: { ...process.env, NG_CLI_ANALYTICS: 'false', DISABLE_TELEMETRY: '1' },
                stdio: ['ignore', fd, fd]
            });
            child.on('error', reject);
            child.on('exit', resolve);
        });
    } finally {
        closeSync(fd);
        save();
    }
    assert.equal(step.code, 0, `${label}: ${log}\n${readFileSync(log, 'utf8').slice(-3000)}`);
    console.log(`Prepared: ${label}`);
    return readFileSync(log, 'utf8').trim();
}
const pnpm = (label, args, directory = root) => run(label, 'pnpm', ['--dir', directory, ...args]);
try {
    assert.equal(process.versions.node.split('.')[0], readFileSync(path.join(root, '.nvmrc'), 'utf8').trim());
    for (const file of ['package.json', 'angular.json', 'tsconfig.json', 'tsconfig.app.json', 'pnpm-workspace.yaml'])
        cpSync(path.join(root, 'tools/consumer-testing/fixture', file), path.join(consumer, file));
    const manifest = JSON.parse(readFileSync(path.join(consumer, 'package.json'), 'utf8'));
    manifest.name = 'radix-ng-generation-experiment';
    manifest.devDependencies['@playwright/test'] = '1.60.0';
    manifest.devDependencies['pnpm'] = '11.5.1';
    writeFileSync(path.join(consumer, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
    writeFileSync(path.join(consumer, '.npmrc'), 'script-shell=/bin/sh\n');
    writeFileSync(
        path.join(consumer, 'src/app/app.ts'),
        `import { Component } from '@angular/core';
@Component({ selector: 'app-root', standalone: true, template: '<main><h1>Project preferences</h1><p>AppSelect has not been implemented.</p></main>' })
export class App {}
`
    );
    writeFileSync(
        path.join(consumer, 'src/main.ts'),
        `import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
bootstrapApplication(App).catch(console.error);
`
    );
    writeFileSync(
        path.join(consumer, 'src/index.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>AppSelect experiment</title><base href="/"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"></head><body><app-root></app-root></body></html>\n'
    );
    writeFileSync(
        path.join(consumer, 'src/styles.css'),
        `:root {
  --app-background: #f5f6fa;
  --app-surface: #ffffff;
  --app-text: #172033;
  --app-muted: #647084;
  --app-border: #bac3d4;
  --app-accent: #3f46ce;
  --app-on-accent: #ffffff;
  --app-focus: #5067f0;
  --app-radius: 0.65rem;
  --app-space: 0.75rem;
}
* { box-sizing: border-box; }
body { margin: 0; padding: 2rem; background: var(--app-background); color: var(--app-text); font: 16px/1.5 system-ui, sans-serif; }
button, input, select { font: inherit; }
button:focus-visible, input:focus-visible { outline: 3px solid var(--app-focus); outline-offset: 3px; }
`
    );
    report.revision = await run('local-revision', 'git', ['rev-parse', 'HEAD']);
    report.pnpm = await pnpm('pnpm-version', ['--version']);
    report.bundle = await installConsumerSkills({ root, consumer, output, pnpm, run });
    report.library = await installPackedLibrary({ root, consumer, output, pnpm });
    const json = (file) => JSON.parse(readFileSync(path.join(consumer, file), 'utf8'));
    report.angular = json('node_modules/@angular/core/package.json').version;
    report.typescript = json('node_modules/typescript/package.json').version;
    report.playwright = json('node_modules/@playwright/test/package.json').version;
    report.contracts = ['select', 'dialog'].map((slug) => ({
        slug,
        apiVersion: json(`.agents/skills/radix-ng/references/api-contract/${slug}.json`).version,
        stylingVersion: json(`.agents/skills/radix-ng/references/styling-contract/${slug}.json`).version
    }));
    await pnpm('blank-scaffold-build', ['build'], consumer);
    writeFileSync(
        path.join(consumer, '.gitignore'),
        'node_modules/\ndist/\n.angular/\n.agent-tmp/\nout-tsc/\ntest-results/\nplaywright-report/\n'
    );
    cpSync(consumer, path.join(output, 'scaffold'), {
        recursive: true,
        filter: (file) => !['node_modules', 'dist', '.angular'].includes(path.basename(file))
    });
    report.scaffold = treeDigest(path.join(output, 'scaffold'));
    report.protectedFiles = Object.fromEntries(
        [
            'package.json',
            'pnpm-lock.yaml',
            'angular.json',
            'tsconfig.json',
            'tsconfig.app.json',
            'pnpm-workspace.yaml',
            'skills-lock.json',
            '.npmrc'
        ].map((file) => [file, sha(readFileSync(path.join(consumer, file)))])
    );
    await run('scaffold-git-init', 'git', ['init', '-q'], consumer);
    await run('scaffold-git-add', 'git', ['add', '.'], consumer);
    await run(
        'scaffold-git-commit',
        'git',
        [
            '-c',
            'user.name=Radix NG experiment',
            '-c',
            'user.email=experiment@localhost',
            'commit',
            '-qm',
            'Initial blank consumer scaffold'
        ],
        consumer
    );
    report.scaffoldCommit = await run('scaffold-revision', 'git', ['rev-parse', 'HEAD'], consumer);
    report.status = 'prepared';
} catch (error) {
    report.status = 'preparation-failed';
    report.error = String(error);
    process.exitCode = 1;
} finally {
    report.finishedAt = new Date().toISOString();
    save();
    console.log(`Preparation report: ${path.join(output, 'preparation.json')}`);
}
