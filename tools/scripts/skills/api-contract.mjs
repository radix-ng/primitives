/**
 * Builds the machine-readable API contract for LLM consumers from compodoc metadata.
 *
 * Source: apps/radix-storybook/.storybook/documentation.json — the same compodoc JSON that
 * powers Storybook's ArgTypes tables, so the contract always matches the documented API.
 * The file is gitignored; when it is missing or older than the primitive sources, compodoc
 * is run automatically (same tsconfig + flags as the Storybook targets).
 *
 * Output (per part): selector, exportAs, inputs (template binding name, unwrapped type,
 * default, required), outputs with payload type, two-way `model()` bindings, hostDirectives.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const COMPODOC_TSCONFIG = 'apps/radix-storybook/.storybook/tsconfig.json';
const COMPODOC_OUT_DIR = 'apps/radix-storybook/.storybook';

const UTILS = new Set([
    'composite',
    'dismissable-layer',
    'focus-scope',
    'inject-id',
    'live-announcer',
    'popper',
    'portal',
    'presence',
    'visually-hidden'
]);

const newestMtime = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).reduce((newest, entry) => {
        if (entry.name === 'node_modules' || entry.name === '__tests__' || entry.name === 'stories') return newest;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return Math.max(newest, newestMtime(fullPath));
        if (!entry.isFile() || !entry.name.endsWith('.ts')) return newest;
        return Math.max(newest, fs.statSync(fullPath).mtimeMs);
    }, 0);

const ensureCompodocJson = (workspaceRoot, primitivesRoot) => {
    const jsonPath = path.join(workspaceRoot, COMPODOC_OUT_DIR, 'documentation.json');
    const upToDate = fs.existsSync(jsonPath) && fs.statSync(jsonPath).mtimeMs >= newestMtime(primitivesRoot);

    if (!upToDate) {
        console.log('· compodoc metadata missing or stale — regenerating documentation.json…');
        execSync(
            `npx compodoc -p ${COMPODOC_TSCONFIG} -e json -d ${COMPODOC_OUT_DIR} ` +
                '--disablePrivate --disableProtected --disableLifeCycleHooks --disableInternal --disableDependencies',
            { cwd: workspaceRoot, stdio: 'inherit' }
        );
    }

    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
};

// `input<T, TransformInput>()` is reported as "T, TransformInput" — keep only the value type.
const cleanType = (type) => (type ?? '').replace(/,\s*[^,]*(?:BooleanInput|NumberInput)[^,]*$/, '').trim();

// Inputs inherited from `RdxPopperContentWrapper` (ADR 0012 thin positioners) default to
// `this.config.<key> ?? <fallback>`, where `config` is the positioner's own
// `provideRdxPopperContentConfig({...})`. Resolve to that config value (or the fallback) so the
// published default matches runtime instead of leaking the base-class expression.
const CONFIG_DEFAULT_RE = /^this\.config\.(\w+)\s*\?\?\s*([\s\S]+)$/;

// A bare `this.config.<key>` (no `?? fallback`) — e.g. `input<number>(this.config.delayMs)`, backed by
// an `injectXxxConfig()` default that can't be statically resolved. Fall back to the authored
// `@defaultValue` JSDoc tag so the published default is the real value instead of the raw expression.
const BARE_CONFIG_RE = /^this\.config\.(\w+)$/;

// compodoc wraps the `@defaultValue` tag comment in HTML (e.g. `<p>0</p>`); strip to the bare literal.
const jsdocDefault = (member) => {
    const tag = (member.jsdoctags ?? []).find((t) => t?.tagName?.escapedText === 'defaultValue');
    const comment = typeof tag?.comment === 'string' ? tag.comment : '';
    return comment.replace(/<[^>]+>/g, '').trim();
};

const parsePositionerConfig = (sourceCode) => {
    const match = /provideRdxPopperContentConfig\(\s*\{([\s\S]*?)\}\s*\)/.exec(sourceCode ?? '');
    if (!match) return {};

    const config = {};
    for (const pair of match[1].split(',')) {
        const kv = /^\s*(\w+)\s*:\s*([\s\S]+?)\s*$/.exec(pair);
        if (kv) config[kv[1]] = kv[2].trim();
    }
    return config;
};

// `defaultValue` is the raw `input()` argument list — drop the options object, then resolve any
// inherited `this.config.<key> ?? <fallback>` against the positioner's config defaults, or a bare
// `this.config.<key>` against the input's `@defaultValue` JSDoc tag.
const cleanDefault = (input, config = {}) => {
    if (input.defaultValue === undefined) return undefined;

    let cleaned = input.defaultValue.replace(/,\s*\{[\s\S]*\}\s*$/, '').trim();

    const inherited = CONFIG_DEFAULT_RE.exec(cleaned);
    const bareConfig = BARE_CONFIG_RE.exec(cleaned);
    if (inherited) {
        const [, key, fallback] = inherited;
        cleaned = (config[key] ?? fallback).trim();
    } else if (bareConfig) {
        cleaned = (config[bareConfig[1]] ?? jsdocDefault(input)).trim();
    }

    return cleaned || undefined;
};

// The template binds the alias, not the class member — surface the alias as the name.
const bindingName = (input) => /alias:\s*'([^']+)'/.exec(input.defaultValue ?? '')?.[1] ?? input.name;

const description = (member) => {
    const text = (member.rawdescription ?? '').trim();
    return text || undefined;
};

const compact = (obj) => Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

export function generateApiContract({ workspaceRoot, primitivesRoot, skillsRoot, version, write }) {
    const doc = ensureCompodocJson(workspaceRoot, primitivesRoot);

    const parts = [...(doc.directives ?? []), ...(doc.components ?? [])]
        .filter((entry) => /^packages\/primitives\/(?!storybook\/)[^/]+\/src\//.test(entry.file) && entry.selector)
        .map((entry) => {
            const pkg = entry.file.match(/^packages\/primitives\/([^/]+)\//)[1];
            // Only thin positioners (those that `extends RdxPopperContentWrapper`) carry a config
            // override; parsing any other entry's source risks matching a `provideRdxPopperContentConfig`
            // example in a doc comment.
            const positionerConfig = entry.extends?.includes('RdxPopperContentWrapper')
                ? parsePositionerConfig(entry.sourceCode)
                : {};
            const inputNames = new Set((entry.inputsClass ?? []).map(bindingName));
            // A `model()` appears in both lists under the same name — that's the two-way set.
            const twoWay = (entry.outputsClass ?? []).map((o) => o.name).filter((name) => inputNames.has(name));

            return {
                slug: pkg,
                section: UTILS.has(pkg) ? 'utils' : 'components',
                file: entry.file,
                part: compact({
                    directive: entry.name,
                    selector: entry.selector,
                    exportAs: entry.exportAs || undefined,
                    description: description(entry),
                    deprecated: entry.deprecated || undefined,
                    hostDirectives: entry.hostDirectives?.length
                        ? entry.hostDirectives.map((host) => host.name)
                        : undefined,
                    inputs: (entry.inputsClass ?? []).map((input) =>
                        compact({
                            name: bindingName(input),
                            type: cleanType(input.type) || undefined,
                            default: cleanDefault(input, positionerConfig),
                            required: input.required || undefined,
                            deprecated: input.deprecated || undefined,
                            description: description(input)
                        })
                    ),
                    outputs: (entry.outputsClass ?? [])
                        .filter((output) => !twoWay.includes(output.name))
                        .map((output) =>
                            compact({
                                name: output.name,
                                type: cleanType(output.type) || undefined,
                                deprecated: output.deprecated || undefined,
                                description: description(output)
                            })
                        ),
                    twoWay: twoWay.length ? twoWay : undefined
                })
            };
        })
        .sort((a, b) => a.slug.localeCompare(b.slug) || a.file.localeCompare(b.file));

    const bySlug = new Map();
    for (const { slug, section, part } of parts) {
        if (!bySlug.has(slug)) bySlug.set(slug, { slug, section, parts: [] });
        bySlug.get(slug).parts.push(part);
    }

    const contract = { version, primitives: [...bySlug.values()] };
    write(path.join(skillsRoot, 'radix-ng/references/api-contract.json'), JSON.stringify(contract, null, 2) + '\n');

    return { primitives: bySlug.size, parts: parts.length };
}
