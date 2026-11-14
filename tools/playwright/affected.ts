import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { floatingConsumers, isFloatingSpec, specFamily } from './test-catalog.ts';
const primitiveOf = (file: string) => /^packages\/primitives\/([^/]+)(?:\/|$)/.exec(file)?.[1];

type Dependencies = Map<string, Set<string>>;
export function dependents(seeds: Iterable<string>, graph: Dependencies): Set<string> {
    const result = new Set(seeds);
    let changed = true;
    while (changed) {
        changed = false;
        for (const [owner, imports] of graph) {
            if (!result.has(owner) && [...imports].some((item) => result.has(item))) {
                result.add(owner);
                changed = true;
            }
        }
    }
    return result;
}

/** Read actual aliases and relative imports, including consumer stories; unit-only imports are excluded. */
export function buildDependencies(files: string[], read: (file: string) => string) {
    const families: Dependencies = new Map();
    const modules: Dependencies = new Map();
    const known = new Set(files);
    for (const file of files) {
        if (!/\.[cm]?[jt]sx?$/.test(file) || file.includes('/__tests__/')) continue;
        const family = primitiveOf(file);
        const testModule = file.startsWith('apps/visual-regression/');
        if (!family && !testModule) continue;
        const imports = ts
            .preProcessFile(read(file), true, true)
            .importedFiles.map((item) => item.fileName.split('?')[0]);
        const moduleImports = new Set<string>();
        const familyImports = families.get(family ?? '') ?? new Set<string>();
        for (const specifier of imports) {
            const relative = specifier.startsWith('.')
                ? posix.normalize(posix.join(posix.dirname(file), specifier))
                : undefined;
            const dependency = specifier.startsWith('@radix-ng/primitives/')
                ? specifier.slice('@radix-ng/primitives/'.length).split('/')[0]
                : relative
                  ? primitiveOf(relative)
                  : undefined;
            if (family && dependency && dependency !== family) familyImports.add(dependency);
            if (relative) {
                const candidates = [relative, `${relative}.ts`, `${relative}.mts`, `${relative}/index.ts`];
                const resolved = candidates.find((name) => known.has(name));
                // Missing/deleted helpers must still select their importers instead of skipping a broken import.
                for (const dependency of resolved ? [resolved] : candidates) moduleImports.add(dependency);
            }
        }
        if (family) families.set(family, familyImports);
        if (testModule) modules.set(file, moduleImports);
    }
    return { families, modules };
}

export function selectChecks(input: {
    changed: string[];
    suites: string[];
    specs: string[];
    families: Dependencies;
    modules?: Dependencies;
    full?: boolean;
}) {
    const seeds = new Set<string>();
    const suites = new Set<string>();
    const specs = new Set<string>();
    const reasons: string[] = [];
    let full = !!input.full;
    let docs = full;
    for (const file of input.changed) {
        if (
            file.startsWith('skills/') ||
            file.startsWith('docs/') ||
            file.endsWith('.md') ||
            file.includes('/__tests__/') ||
            file.includes('-snapshots/')
        )
            continue;
        if (file.startsWith('apps/parity-testing/primitives/')) {
            const suite = file.split('/')[3];
            if (input.suites.includes(suite)) suites.add(suite);
            else full = true;
            continue;
        }
        if (file.startsWith('apps/parity-testing/')) {
            input.suites.forEach((name) => suites.add(name));
            continue;
        }
        const family = primitiveOf(file);
        if (family === 'core') {
            full = true;
            reasons.push(file);
            continue;
        }
        if (family && !['storybook', 'schematics'].includes(family)) {
            if (!file.includes('/__tests__/')) seeds.add(family);
            if (file.endsWith('.mdx')) docs = true;
            continue;
        }
        if (file.startsWith('apps/visual-regression/tests/')) {
            if (input.specs.includes(file)) specs.add(file);
            else if (/\/(docs-navigation|agents)\.behavior\.spec\.ts$/.test(file)) docs = true;
            else if (file.endsWith('.visual.spec.ts')) continue;
            else full = true;
            continue;
        }
        if (file.startsWith('apps/visual-regression/helpers/')) {
            const affected = dependents([file], input.modules ?? new Map());
            input.specs.filter((name) => affected.has(name)).forEach((name) => specs.add(name));
            continue;
        }
        if (file.startsWith('.github/workflows/') && file !== '.github/workflows/ci.yml') continue;
        // Shared engine/config/build/tooling changes and unknown paths fail closed to full coverage.
        full = true;
        reasons.push(file);
    }
    const affected = dependents(seeds, input.families);
    // Public Agents reference fixtures cover these four families (tsconfig.agents.json).
    docs ||= ['field', 'select', 'menu', 'tabs'].some((family) => affected.has(family));
    for (const suite of input.suites) if (affected.has(suite)) suites.add(suite);
    for (const file of input.specs) {
        if (
            affected.has(specFamily(file)) ||
            (specFamily(file) === 'floating-consumers' && [...affected].some((name) => floatingConsumers.has(name)))
        )
            specs.add(file);
    }
    if (full) {
        input.suites.forEach((name) => suites.add(name));
        input.specs.forEach((name) => specs.add(name));
        docs = true;
    }
    return {
        full,
        affected: [...affected].sort(),
        suites: [...suites].sort(),
        floating: [...specs].sort(),
        docs,
        browser: docs || specs.size > 0,
        reasons
    };
}

/** An unavailable comparison base must broaden coverage, never produce an empty plan. */
export function changesSince(
    base: string | undefined,
    head = 'HEAD',
    git = (args: string[]) => execFileSync('git', args, { encoding: 'utf8' })
) {
    if (!base) return { full: true, changed: [] as string[] };
    try {
        const commit = (ref: string) => git(['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]).trim();
        const changed = git(['diff', '--name-only', '--no-renames', '-z', `${commit(base)}...${commit(head)}`, '--'])
            .split('\0')
            .filter(Boolean);
        return { full: false, changed };
    } catch {
        return { full: true, changed: [] as string[] };
    }
}

export function planFromGit() {
    const files = [
        ...new Set(
            execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' })
                .split('\0')
                .filter(Boolean)
        )
    ];
    const specs = files.filter((file) => file.startsWith('apps/visual-regression/tests/') && isFloatingSpec(file));
    const suites = readdirSync('apps/parity-testing/primitives').filter((name) =>
        existsSync(`apps/parity-testing/primitives/${name}/suite.json`)
    );
    const comparison = changesSince(process.env.NX_BASE, process.env.NX_HEAD);
    const full = comparison.full || process.argv.includes('--full') || process.env.FORCE_FULL === 'true';
    const graph = buildDependencies(files, (file) => (existsSync(file) ? readFileSync(file, 'utf8') : ''));
    return selectChecks({ changed: comparison.changed, suites, specs, ...graph, full });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const plan = planFromGit();
    console.log(JSON.stringify(plan, null, 2));
    if (process.env.GITHUB_OUTPUT) {
        for (const key of ['suites', 'floating', 'docs', 'browser', 'full'] as const)
            appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${JSON.stringify(plan[key])}\n`);
    }
    if (process.env.GITHUB_STEP_SUMMARY)
        appendFileSync(
            process.env.GITHUB_STEP_SUMMARY,
            `### Browser check scope\n\nMode: ${plan.full ? 'full' : 'affected'}.\n\nPinned suites: ${plan.suites.join(', ') || 'none'}.\n\nFloating specs: ${plan.floating.length}. Docs: ${plan.docs}.\n`
        );
}
