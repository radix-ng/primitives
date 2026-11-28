import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildDependencies, changesSince, selectChecks } from './affected.ts';
import { isFloatingSpec, specFamily } from './test-catalog.ts';

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
    assert.deepEqual(result.comparisons, [
        { suite: 'context-menu', shard: '1/1', name: 'context-menu' },
        { suite: 'menu', shard: '1/3', name: 'menu-1-of-3' },
        { suite: 'menu', shard: '2/3', name: 'menu-2-of-3' },
        { suite: 'menu', shard: '3/3', name: 'menu-3-of-3' },
        { suite: 'menubar', shard: '1/1', name: 'menubar' }
    ]);
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
    assert.deepEqual(result.comparisons, []);
});

test('hydration fixtures and shared lifetimes select real SSR browser checks', () => {
    for (const file of [
        'apps/radix-ssr-testing/hydration-audit/app.ts',
        'packages/primitives/portal/src/portal-presence.ts',
        'packages/primitives/accordion/src/accordion-panel.directive.ts',
        'packages/primitives/toast/src/toast-root.ts',
        'packages/primitives/collapsible/src/collapsible-panel.directive.ts',
        'packages/primitives/label/src/label.directive.ts',
        'packages/primitives/field/src/field-validity.ts',
        'packages/primitives/progress/src/progress-root.directive.ts',
        'packages/primitives/meter/src/meter-root.directive.ts',
        'packages/primitives/presence/src/use-presence.ts',
        'packages/primitives/floating-focus-manager/src/trigger-interaction.ts',
        'packages/primitives/popover/src/popover-root.ts',
        'packages/primitives/core/src/id-generator.ts'
    ]) {
        const result = plan([file]);
        assert.equal(result.hydration, true, file);
        assert.equal(result.browser, true, file);
    }
    const fixture = plan(['apps/radix-ssr-testing/hydration-audit/app.ts']);
    assert.equal(fixture.full, false);
    assert.deepEqual(fixture.floating, []);
    assert.deepEqual(fixture.suites, []);
    assert.equal(plan(['packages/primitives/button/src/button.ts']).hydration, false);
    assert.equal(plan([], { full: true }).hydration, true);
});

test('Presence, Tabs and Accordion motion regressions participate in affected and full browser runs', () => {
    const motionSpecs = ['presence-waapi', 'tabs', 'accordion'].map(spec);
    for (const file of motionSpecs) assert.equal(isFloatingSpec(file), true);
    assert.equal(specFamily(spec('presence-waapi')), 'presence');
    const families = new Map([
        ['tabs', new Set(['presence'])],
        ['accordion', new Set(['presence', 'collapsible'])]
    ]);
    for (const changed of [
        ['packages/primitives/presence/src/use-presence.ts'],
        ['packages/primitives/core/src/composables/use-render-lifecycle.ts']
    ]) {
        const result = selectChecks({ changed, families, specs: motionSpecs, suites: [] });
        assert.deepEqual(result.floating, [...motionSpecs].sort());
    }
    const tabs = selectChecks({
        changed: ['packages/primitives/tabs/src/tabs-panel.ts'],
        families,
        specs: motionSpecs,
        suites: []
    });
    assert.deepEqual(tabs.floating, [spec('tabs')]);
    const accordion = selectChecks({
        changed: ['packages/primitives/collapsible/src/collapsible-panel.directive.ts'],
        families,
        suites: ['accordion', 'tabs'],
        specs: motionSpecs
    });
    assert.deepEqual(accordion.suites, ['accordion']);
    assert.deepEqual(accordion.floating, [spec('accordion')]);
});
test('Agents reference families select their browser checks without broadening to unrelated suites', () => {
    for (const family of ['field', 'select', 'menu', 'tabs']) {
        const result = plan([`packages/primitives/${family}/src/root.ts`]);
        assert.equal(result.docs, true, family);
        assert.equal(result.full, false, family);
    }
    assert.equal(plan(['packages/primitives/button/src/button.directive.ts']).docs, false);
});
test('shared element registry changes include roving and active-descendant collection checks', () => {
    const collectionSpecs = ['composite', 'combobox', 'autocomplete'].map(spec);
    for (const file of collectionSpecs) assert.equal(isFloatingSpec(file), true);
    const result = selectChecks({
        changed: ['packages/primitives/core/src/composables/use-element-registry.ts'],
        families: new Map(),
        specs: collectionSpecs,
        suites: []
    });
    assert.deepEqual(result.floating, [...collectionSpecs].sort());
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
        assert.equal(records.length, 6);
        const values = Object.fromEntries(
            records.map((record) => {
                const separator = record.indexOf('=');
                return [record.slice(0, separator), JSON.parse(record.slice(separator + 1))];
            })
        );
        assert.equal(values.full, true);
        assert.equal(values.browser, true);
        assert.equal(values.hydration, true);
        assert.deepEqual(
            values.comparisons.filter((job: { suite: string }) => job.suite === 'menu'),
            [
                { suite: 'menu', shard: '1/3', name: 'menu-1-of-3' },
                { suite: 'menu', shard: '2/3', name: 'menu-2-of-3' },
                { suite: 'menu', shard: '3/3', name: 'menu-3-of-3' }
            ]
        );
        assert.ok(values.comparisons.some((job: { name: string }) => job.name === 'menubar'));
        assert.ok(values.floating.includes(spec('menubar')));
        assert.ok(values.floating.includes(spec('presence-waapi')));
        assert.ok(values.floating.includes(spec('tabs')));
        assert.ok(readFileSync(summary, 'utf8').split('\n').length > 5);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
