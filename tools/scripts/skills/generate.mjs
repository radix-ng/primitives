/**
 * Generates the LLM-facing consumer skills from the Storybook docs — the single source of
 * truth for examples and the data-attribute styling contract. Fully self-contained: the
 * skills bundle the rendered docs offline and do NOT depend on any deployed site.
 *
 *   node tools/scripts/skills/generate.mjs
 *
 * Outputs (do not edit by hand — regenerated):
 *   skills/radix-ng/references/styling-contract.json     parts + data-* per primitive
 *   skills/radix-ng/references/api-contract.json         selectors + inputs/outputs per part (from compodoc)
 *   skills/radix-ng-examples/SKILL.md                    index of every documented example
 *   skills/radix-ng-examples/references/<section>/<slug>.md   full rendered docs (with code)
 *   skills/radix-ng-examples/references/llms-full.txt     all docs concatenated, one file
 *
 * The hand-authored skill body (skills/radix-ng/SKILL.md + its reference *.md files) is
 * not touched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateApiContract } from './api-contract.mjs';
import { createMarkdownBundle } from './markdown-bundle.mjs';
import { validateMarkdownLinks } from './markdown-links.mjs';
import { getStorybookDocs } from './storybook-docs.mjs';
import { parseDataAttributes } from './styling-contract.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../../..');
const primitivesRoot = path.join(workspaceRoot, 'packages/primitives');
const skillsRoot = path.join(workspaceRoot, 'skills');

// Storybook is served under /docs and also serves the LLM docs bundle as static files
// (see apps/radix-storybook/.storybook/main.ts staticDirs): /llms.txt, /llms-full.txt, /<section>/<slug>.md.
const SITE_URL = 'https://radix-ng.com/docs';

// Version stamp: lets a consumer's agent detect that the docs bundle and the installed
// @radix-ng/primitives version have drifted apart.
const VERSION = JSON.parse(fs.readFileSync(path.join(primitivesRoot, 'package.json'), 'utf8')).version;
const versionLine = `Generated from \`@radix-ng/primitives@${VERSION}\` — if the installed version differs, verify the API against the installed package.`;

const write = (filePath, content) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
};

// --- raw MDX parsing for the structured styling contract ---

const findMdx = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return findMdx(fullPath);
        return entry.isFile() && entry.name.endsWith('.docs.mdx') ? [fullPath] : [];
    });

const titleToSlug = (title) =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const getSlug = (filePath) => {
    const fileName = path.basename(filePath, '.docs.mdx');
    const packageName = path.basename(path.dirname(path.dirname(filePath)));
    // Recipes live under packages/primitives/recipes/** and may be nested in
    // per-recipe subfolders — always slug by filename regardless of nesting depth.
    const inRecipes = path.relative(primitivesRoot, filePath).split(path.sep)[0] === 'recipes';
    if (inRecipes || packageName === 'primitives' || packageName === 'core' || fileName === 'sheet') {
        return titleToSlug(fileName);
    }
    return packageName;
};

const sectionOf = (group) =>
    ({ Utilities: 'utils', Guides: 'guides', Recipes: 'recipes', Examples: 'examples' })[group] ?? 'components';

const sectionBody = (content, heading) => {
    const start = new RegExp(`^##\\s+${heading}\\s*$`, 'm').exec(content);
    if (!start) return '';
    const rest = content.slice(start.index + start[0].length);
    const next = /^##\s+/m.exec(rest);
    return (next ? rest.slice(0, next.index) : rest).trim();
};

const parseAnatomy = (content) => {
    const match = /```html\n([\s\S]*?)```/.exec(sectionBody(content, 'Anatomy'));
    return match ? match[1].trim() : '';
};

const parseExamples = (content) => {
    const body = sectionBody(content, 'Examples');
    if (!body) return [];

    const lines = body.split('\n');
    const examples = [];
    for (let i = 0; i < lines.length; i++) {
        const heading = /^###\s+(.+?)\s*$/.exec(lines[i]);
        if (!heading) continue;
        let description = '';
        for (let j = i + 1; j < lines.length; j++) {
            const line = lines[j].trim();
            if (!line || line.startsWith('###')) break;
            if (line.startsWith('<') || line.startsWith('```')) break;
            description = line;
            break;
        }
        examples.push({ name: heading[1].trim(), description });
    }
    return examples;
};

const mdxMeta = new Map(
    findMdx(primitivesRoot).map((filePath) => {
        const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n?/g, '\n');
        const group = content.match(/<Meta\b[^>]*title=["']([^"']+)["'][^>]*\/>/)?.[1]?.split('/')[0];
        const slug = getSlug(filePath);
        const section = sectionOf(group || 'Primitives');
        return [
            `${section}/${slug}`,
            {
                anatomy: parseAnatomy(content),
                dataAttributes: parseDataAttributes(content),
                examples: parseExamples(content)
            }
        ];
    })
);

// --- rendered docs (Canvas → real example code) ---

const docs = getStorybookDocs();
const metaFor = (doc) => mdxMeta.get(`${doc.section}/${doc.slug}`) ?? {};
const { files: markdownFiles, exampleShardCount, fullDocs } = createMarkdownBundle(docs, { versionLine, metaFor });

// 1. bundled per-component docs + llms-full.txt (offline, no site dependency)
const refsRoot = path.join(skillsRoot, 'radix-ng-examples/references');
for (const section of ['agents', 'overview', 'learn', 'components', 'utils', 'guides', 'recipes', 'examples']) {
    const sectionRoot = path.join(refsRoot, section);
    if (!fs.existsSync(sectionRoot)) continue;

    for (const entry of fs.readdirSync(sectionRoot, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
            fs.rmSync(path.join(sectionRoot, entry.name));
        }
    }
}

for (const [file, content] of markdownFiles) write(path.join(refsRoot, file), `${content}\n`);

const llmsFull = [
    '# Radix NG Primitives — Full Documentation',
    'Unstyled, accessible, signals-first Angular primitives for building design systems and web apps.',
    'Examples use Angular signals and Tailwind CSS v4 utilities; the primitives themselves are styling-agnostic.',
    versionLine,
    ...fullDocs.map((body) => `---\n\n${body}`)
].join('\n\n');
write(path.join(refsRoot, 'llms-full.txt'), `${llmsFull}\n`);

// llms.txt index (served at SITE_URL/llms.txt) — links to the served per-page Markdown
const sectionTitles = {
    agents: 'Agents',
    overview: 'Overview',
    learn: 'Learn',
    components: 'Components',
    utils: 'Utilities',
    guides: 'Guides',
    recipes: 'Recipes',
    examples: 'Examples'
};
const llmsIndex = [
    '# Radix NG Primitives',
    'Unstyled, accessible, signals-first Angular primitives for building design systems and web apps.',
    `Full documentation in one file: ${SITE_URL}/llms-full.txt`,
    versionLine,
    ...Object.entries(sectionTitles)
        .map(([section, title]) => {
            const links = docs
                .filter((doc) => doc.section === section)
                .map((doc) => `- [${doc.title}](${SITE_URL}/${doc.section}/${doc.slug}.md): ${doc.description}`);
            return links.length ? `## ${title}\n\n${links.join('\n')}` : null;
        })
        .filter(Boolean)
].join('\n\n');
write(path.join(refsRoot, 'llms.txt'), `${llmsIndex}\n`);

// 2. styling contract (components + utilities)
const contract = docs
    .filter((doc) => doc.section === 'components' || doc.section === 'utils')
    .map((doc) => {
        const meta = metaFor(doc);
        return {
            name: doc.title,
            slug: doc.slug,
            section: doc.section,
            description: doc.description,
            doc: `radix-ng-examples/references/${doc.section}/${doc.slug}.md`,
            storybook: `${SITE_URL}/?path=/docs/primitives-${doc.slug}--docs`,
            anatomy: meta.anatomy ?? '',
            dataAttributes: meta.dataAttributes ?? []
        };
    });
// Per-primitive shards (progressive disclosure) — rebuild the dir so a removed primitive
// leaves no orphan behind. The monolith is kept one release, flagged deprecated.
const stylingShardDir = path.join(skillsRoot, 'radix-ng/references/styling-contract');
fs.rmSync(stylingShardDir, { recursive: true, force: true });
for (const primitive of contract) {
    write(
        path.join(stylingShardDir, `${primitive.slug}.json`),
        JSON.stringify({ version: VERSION, ...primitive }, null, 2) + '\n'
    );
}
write(
    path.join(skillsRoot, 'radix-ng/references/styling-contract.json'),
    JSON.stringify(
        {
            version: VERSION,
            deprecated:
                'Superseded by per-primitive styling-contract/<slug>.json shards; this monolith will be removed in the next release.',
            primitives: contract
        },
        null,
        2
    ) + '\n'
);

// 3. examples index skill
const componentDocs = docs.filter((doc) => doc.section === 'components' && (metaFor(doc).examples ?? []).length);
const totalExamples = componentDocs.reduce((sum, doc) => sum + metaFor(doc).examples.length, 0);

// One line per component: the name links to its full-source doc, followed by the
// component's own description and an example count. Both the example names AND their
// source stay in per-component references/components/<slug>.md (one drill-down away) —
// paying ~8KB of inline example names eagerly, for every component on every activation,
// to save the agent one on-demand read of the chosen component's doc is a bad trade.
const indexBody = componentDocs
    .map((doc) => {
        const count = metaFor(doc).examples.length;
        return `- **[${doc.title}](./references/components/${doc.slug}.md)** — ${doc.description} _(${count} example${count === 1 ? '' : 's'})_`;
    })
    .join('\n');

const examplesSkill = `---
name: radix-ng-examples
description: |
  Index of every documented @radix-ng/primitives example. Use when implementing a UI
  feature to find a documented Angular pattern built on the primitives.
  Each component has an index doc linking to per-example source shards you can adapt.
compatibility: Requires @radix-ng/primitives in an Angular project matching the package's peer dependencies.
license: MIT
metadata:
  author: radix-ng
---

# Radix NG Primitives — Examples Index

> Auto-generated by \`tools/scripts/skills/generate.mjs\` from the Storybook docs.
> Do not edit by hand — the Storybook stories are the source of truth.
> ${versionLine}

Working examples built on \`@radix-ng/primitives\`. Full source is **bundled offline** under
\`references/\`; browse visually at ${SITE_URL}.

## How to use this skill

Compare the installed library version with the shard's \`version\` or generation stamp first. If
they differ, installed exports and \`.d.ts\` files take precedence. Compile the consumer's Angular
templates and check its behavior; examples and skills do not guarantee a correct generated result.

1. Describe the UI you want to build (e.g. "a multi-select combobox", "a form field with validation").
2. Find the matching component below by name and description.
3. Open that component's bundled \`references/components/<slug>.md\` — an index with the import,
   anatomy, and a link to each example's full source (\`references/examples/<slug>--<example>.md\`).
4. Open the example shard you need and adapt it: keep the primitive directives and \`data-*\` styling
   hooks, swap in the project's own design-system classes/tokens.

To style a primitive with a custom design system, pair an example with its per-primitive data-attribute
contract in the \`radix-ng\` skill (\`references/styling-contract/<slug>.json\`).

For installation, composition and verification tasks, read \`references/agents/getting-started.md\`
and follow its links to the other Agents guides.

**Reload a single example** (e.g. after your context is compacted): open
\`references/examples/<component>--<example>.md\` — one file per example, just that example's source,
addressed by the component slug and the kebab-cased example name. Cheaper than re-reading the whole
component doc.

Total: **${totalExamples} examples** across **${componentDocs.length} components**.

## Components

${indexBody}
`;
write(path.join(skillsRoot, 'radix-ng-examples/SKILL.md'), examplesSkill);

// 4. API contract (selectors + inputs/outputs per part, from compodoc metadata)
const api = generateApiContract({ workspaceRoot, primitivesRoot, skillsRoot, version: VERSION, write });

// 4b. Integrity guards — CI surfaces any failure through the `pnpm skills:build` step. They keep the
// progressive-disclosure structure honest: version stamps, component ↔ contract ↔ example correspondence,
// no orphan shards after a rename, and no dangling relative links in the router or the component indexes.
const errors = [];
const warnings = [];
let publicRoutes = 0;
for (const primitive of contract) {
    for (const hook of primitive.dataAttributes) {
        if (!/^data-[a-z0-9-]+$/.test(hook.attribute) || !hook.parts || !hook.values) {
            errors.push(`styling-contract/${primitive.slug}.json: incomplete documented hook ${JSON.stringify(hook)}`);
        }
    }
}
const componentSlugs = docs.filter((doc) => doc.section === 'components').map((doc) => doc.slug);
const stylingSlugs = new Set(contract.map((primitive) => primitive.slug));
const apiSlugs = new Set(api.slugs);
const docSlugs = new Set(docs.map((doc) => doc.slug));
const exampleShardSlugs = new Set(
    fs.readdirSync(path.join(refsRoot, 'examples')).map((file) => file.replace(/--.*$/, ''))
);

for (const dir of ['radix-ng/references/api-contract', 'radix-ng/references/styling-contract']) {
    for (const file of fs.readdirSync(path.join(skillsRoot, dir))) {
        const json = JSON.parse(fs.readFileSync(path.join(skillsRoot, dir, file), 'utf8'));
        if (json.version !== VERSION) errors.push(`${dir}/${file}: version "${json.version}" != "${VERSION}"`);
    }
}

for (const slug of componentSlugs) {
    if (!apiSlugs.has(slug)) errors.push(`component "${slug}": no api-contract shard`);
    if (!stylingSlugs.has(slug)) errors.push(`component "${slug}": no styling-contract shard`);
    // A doc whose Examples section has no `###`-headed examples yields no shards — a doc-completeness
    // gap, not a bundle defect. Surface it (never silently), but don't fail the build on it.
    if (!exampleShardSlugs.has(slug))
        warnings.push(`component "${slug}": no example shards (no \`###\`-headed examples)`);
}

for (const slug of exampleShardSlugs) {
    if (!componentSlugs.includes(slug)) errors.push(`orphan example shards "${slug}--*.md": no component doc`);
}
for (const file of fs.readdirSync(path.join(skillsRoot, 'radix-ng/references/styling-contract'))) {
    const slug = file.replace(/\.json$/, '');
    if (!docSlugs.has(slug)) errors.push(`orphan styling-contract/${file}: no doc "${slug}"`);
}

errors.push(
    ...validateMarkdownLinks(
        new Map([
            ...[...markdownFiles].map(([file, content]) => [`references/${file}`, content]),
            ['SKILL.md', examplesSkill],
            ['references/llms-full.txt', llmsFull]
        ])
    )
);
for (const doc of docs.filter((doc) => doc.section === 'agents')) {
    for (const [, reference] of doc.body.matchAll(/`references\/(examples\/[^`]+\.md)`/g)) {
        if (!reference.includes('<') && !fs.existsSync(path.join(refsRoot, reference)))
            errors.push(`Agents/${doc.slug}: missing example ${reference}`);
    }
}

// Public-route stability: every URL llms.txt advertises must resolve to a served file. The bundle is
// served at radix-ng.com/docs/<path> ← references/<path> (Storybook staticDirs map references/ to the site
// root). With the CI drift check on llms.txt this means a public URL can neither 404 silently nor change
// unreviewed — a renamed/removed slug shows up as a reviewable diff in llms.txt.
const llmsTxt = fs.readFileSync(path.join(refsRoot, 'llms.txt'), 'utf8');
for (const match of llmsTxt.matchAll(new RegExp(`\\]\\(${SITE_URL}/([^)\\s]+)\\)`, 'g'))) {
    publicRoutes++;
    if (!fs.existsSync(path.join(refsRoot, match[1]))) {
        errors.push(`llms.txt advertises ${SITE_URL}/${match[1]} but references/${match[1]} is not served`);
    }
}
if (!fs.existsSync(path.join(refsRoot, 'llms-full.txt'))) {
    errors.push(`llms.txt links ${SITE_URL}/llms-full.txt, but references/llms-full.txt is missing`);
}

if (warnings.length) {
    console.warn(
        `⚠ ${warnings.length} component(s) without example shards:\n${warnings.map((w) => `  ${w}`).join('\n')}`
    );
}
if (errors.length) {
    throw new Error(`Skills bundle integrity check failed:\n${errors.map((error) => `  ${error}`).join('\n')}`);
}

// 5. Eager-load budget. A SKILL.md is the ONLY file pulled into a consumer agent's context on
// skill activation — everything under references/ loads on demand. Oversized SKILL.md files are
// therefore the main way this bundle could *accelerate* a consumer's context compaction, so cap
// them here. A regression (e.g. re-expanding every example inline) throws, which CI surfaces via
// the `pnpm skills:build` step. references/ shards are intentionally unbounded — they only cost
// context when explicitly opened. Raise a budget only with a deliberate reason.
const SKILL_BUDGETS = [
    { file: 'radix-ng/SKILL.md', maxLines: 200, maxBytes: 14_000, source: 'hand-authored' },
    { file: 'radix-ng-examples/SKILL.md', maxLines: 120, maxBytes: 12_000, source: 'generated' }
];
const budgetErrors = SKILL_BUDGETS.flatMap(({ file, maxLines, maxBytes, source }) => {
    const content = fs.readFileSync(path.join(skillsRoot, file), 'utf8');
    const lines = content.split('\n').length;
    const bytes = Buffer.byteLength(content, 'utf8');
    const over = [];
    if (lines > maxLines) over.push(`${lines} lines > ${maxLines}`);
    if (bytes > maxBytes) over.push(`${bytes} bytes > ${maxBytes}`);
    return over.length ? [`  ${file} (${source}): ${over.join('; ')}`] : [];
});
if (budgetErrors.length) {
    throw new Error(
        `SKILL.md eager-load budget exceeded — these files load into a consumer agent's context on ` +
            `skill activation and must stay small:\n${budgetErrors.join('\n')}\n` +
            `Move detail into references/ (loaded on demand), or raise the budget in generate.mjs deliberately.`
    );
}

console.log(`✓ ${docs.length} docs rendered → ${path.relative(workspaceRoot, refsRoot)}/<section>/`);
console.log(`✓ ${exampleShardCount} example shards → ${path.relative(workspaceRoot, refsRoot)}/examples/`);
console.log(`✓ llms.txt + llms-full.txt (${docs.length} docs)`);
console.log(`✓ styling-contract: ${contract.length} shards + deprecated monolith`);
console.log(`✓ api-contract: ${api.primitives} shards + deprecated monolith (${api.parts} parts)`);
console.log(
    `✓ integrity guards passed (version, correspondence, orphans, links/anchors, ${publicRoutes} public routes)`
);
console.log(`✓ radix-ng-examples/SKILL.md (${totalExamples} examples / ${componentDocs.length} components)`);
