import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildDependencies, changesSince, selectChecks } from './affected.ts';

const spec = (name: string) => `apps/visual-regression/tests/${name}.behavior.spec.ts`;
const families = new Map([
    ['menu', new Set(['popper'])],
    ['menubar', new Set(['menu'])],
    ['context-menu', new Set(['menu'])],
    ['popover', new Set(['popper'])],
    ['select', new Set(['popper'])]
]);
const suites = ['context-menu', 'menu', 'menubar', 'popover', 'select'];
const specs = ['menu', 'menu-submenu', 'menubar', 'context-menu', 'popover', 'select', 'floating-consumers'].map(spec);
const plan = (changed: string[], extra = {}) => selectChecks({ changed, families, suites, specs, ...extra });

test('a menubar change selects its own suite without selecting upstream dependencies', () => {
    const result = plan(['packages/primitives/menubar/src/menubar-root.ts']);
    assert.deepEqual(result.suites, ['menubar']);
    assert.deepEqual(result.floating, [spec('menubar')]);
});
test('Menu changes include both dependent families, submenu checks and shared consumers', () => {
    const result = plan(['packages/primitives/menu/src/menu-root.ts']);
    assert.deepEqual(result.suites, ['context-menu', 'menu', 'menubar']);
    assert.deepEqual(
        result.floating,
        ['context-menu', 'floating-consumers', 'menu-submenu', 'menu', 'menubar'].map(spec).sort()
    );
});
test('Popper changes follow all transitive consumers', () => {
    assert.deepEqual(plan(['packages/primitives/popper/src/popper-root.ts']).suites, suites);
});
test('core, configuration, unknown changes and explicit full mode fail closed', () => {
    for (const file of [
        'packages/primitives/core/src/dom/document.ts',
        'pnpm-lock.yaml',
        '.nvmrc',
        'tsconfig.base.json',
        '.github/workflows/ci.yml',
        'unclassified.ts'
    ]) {
        const result = plan([file]);
        assert.equal(result.full, true, file);
        assert.equal(result.docs, true, file);
        assert.deepEqual(result.suites, suites);
        assert.deepEqual(result.floating, [...specs].sort());
    }
    assert.equal(plan([], { full: true }).full, true);
});
test('a per-suite fixture only selects that suite; shared parity tooling selects every pinned suite', () => {
    assert.deepEqual(plan(['apps/parity-testing/primitives/menu/src/angular.ts']).suites, ['menu']);
    const result = plan(['apps/parity-testing/shared/menu-probe.ts']);
    assert.deepEqual(result.suites, suites);
    assert.deepEqual(result.floating, []);
});
test('direct browser edits select that spec, without pinned comparisons', () => {
    const result = plan([spec('menubar')]);
    assert.deepEqual(result.floating, [spec('menubar')]);
    assert.deepEqual(result.suites, []);
});
test('Agents reference families select their browser checks without broadening to unrelated suites', () => {
    for (const family of ['field', 'select', 'menu', 'tabs']) {
        const result = plan([`packages/primitives/${family}/src/root.ts`]);
        assert.equal(result.docs, true, family);
        assert.equal(result.full, false, family);
    }
    assert.equal(plan(['packages/primitives/button/src/button.directive.ts']).docs, false);
});
test('helper changes follow transitive relative imports and do not select unrelated specs', () => {
    const helper = 'apps/visual-regression/helpers/clock.ts';
    const intermediate = 'apps/visual-regression/helpers/navigation.ts';
    const modules = new Map([
        [spec('menu'), new Set([intermediate])],
        [intermediate, new Set([helper])]
    ]);
    assert.deepEqual(plan([helper], { modules }).floating, [spec('menu')]);
});
test('documentation-only, unit-only and generated skill changes do not launch browser jobs', () => {
    for (const file of [
        'docs/adr/0001-example.md',
        'README.md',
        'skills/radix-ng/SKILL.md',
        'packages/primitives/menu/__tests__/menu.spec.ts'
    ]) {
        const result = plan([file]);
        assert.equal(result.browser, false, file);
        assert.deepEqual(result.suites, []);
    }
    assert.equal(plan(['apps/visual-regression/tests/docs-navigation.behavior.spec.ts']).docs, true);
    const agents = plan(['apps/visual-regression/tests/agents.behavior.spec.ts']);
    assert.equal(agents.docs, true);
    assert.equal(agents.full, false);
});
test('the dependency graph reads actual aliases and relative story composition', () => {
    const sources = {
        'packages/primitives/menu/src/root.ts': "import { x } from '@radix-ng/primitives/popper';",
        'packages/primitives/menubar/stories/example.ts': "export { x } from '../../menu';",
        'packages/primitives/menu/__tests__/test.ts': "import { x } from '@radix-ng/primitives/select';",
        [spec('menu')]: "import { x } from '../helpers/deleted';"
    };
    const graph = buildDependencies(Object.keys(sources), (file) => sources[file as keyof typeof sources]);
    assert.deepEqual([...graph.families.get('menu')!], ['popper']);
    assert.deepEqual([...graph.families.get('menubar')!], ['menu']);
    assert.deepEqual(plan(['apps/visual-regression/helpers/deleted.ts'], graph).floating, [spec('menu')]);
});

test('missing or invalid comparison history broadens to full coverage', () => {
    const unavailable = () => {
        throw new Error('missing commit');
    };
    assert.deepEqual(changesSince(undefined, 'HEAD', unavailable), { full: true, changed: [] });
    assert.deepEqual(changesSince('missing', 'HEAD', unavailable), { full: true, changed: [] });
    const calls: string[][] = [];
    const result = changesSince('base', 'head', (args) => {
        calls.push(args);
        return args[0] === 'rev-parse' ? `${args.at(-1)}-sha\n` : `${spec('menu')}\0`;
    });
    assert.deepEqual(result, { full: false, changed: [spec('menu')] });
    assert.deepEqual(calls.at(-1), [
        'diff',
        '--name-only',
        '--no-renames',
        '-z',
        'base^{commit}-sha...head^{commit}-sha',
        '--'
    ]);
    assert.ok(calls.slice(0, 2).every((args) => args.includes('--end-of-options')));
});

test('runtime assets select their primitive while screenshot baselines do not launch browsers', () => {
    assert.deepEqual(plan(['packages/primitives/menubar/stories/icon.svg']).suites, ['menubar']);
    assert.equal(plan(['apps/visual-regression/tests/stories.visual.spec.ts-snapshots/example.png']).browser, false);
    assert.equal(plan(['packages/primitives/core/__tests__/document.spec.ts']).browser, false);
});

test('the CLI emits separate GitHub output records and a readable summary', () => {
    const directory = mkdtempSync(join(tmpdir(), 'radix-browser-scope-'));
    const output = join(directory, 'output');
    const summary = join(directory, 'summary');
    try {
        execFileSync(process.execPath, [fileURLToPath(new URL('./affected.ts', import.meta.url)), '--full'], {
            env: { ...process.env, GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary }
        });
        const records = readFileSync(output, 'utf8').trim().split('\n');
        assert.equal(records.length, 5);
        const values = Object.fromEntries(
            records.map((record) => {
                const separator = record.indexOf('=');
                return [record.slice(0, separator), JSON.parse(record.slice(separator + 1))];
            })
        );
        assert.equal(values.full, true);
        assert.equal(values.browser, true);
        assert.ok(values.suites.includes('menubar'));
        assert.ok(values.floating.includes(spec('menubar')));
        assert.ok(readFileSync(summary, 'utf8').split('\n').length > 5);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
