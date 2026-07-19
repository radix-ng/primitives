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
import { getStorybookDocs } from './storybook-docs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../../..');
const primitivesRoot = path.join(workspaceRoot, 'packages/primitives');
const skillsRoot = path.join(workspaceRoot, 'skills');

// Storybook is served on the main domain and also serves the LLM docs bundle as static files
// (see apps/radix-storybook/.storybook/main.ts staticDirs): /llms.txt, /llms-full.txt, /<section>/<slug>.md.
const SITE_URL = 'https://radix-ng.com';

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

const parseDataAttributes = (content) => {
    const body = sectionBody(content, 'Data attributes');
    if (!body) return [];

    const rows = body
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('|') && !/^\|[\s:|-]+\|?$/.test(line));

    const cells = (line) =>
        line
            .replace(/^\||\|$/g, '')
            .split(/(?<!\\)\|/) // split on table pipes only, keep escaped \| inside a cell
            .map((cell) => cell.trim().replace(/\\\|/g, '|').replace(/`/g, ''));

    return rows
        .slice(1) // drop the header row
        .map((line) => {
            const [attribute, parts, values] = cells(line);
            return attribute ? { attribute, parts: parts ?? '', values: values ?? '' } : null;
        })
        .filter(Boolean);
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

// Split a rendered doc body's "## Examples" section into one block per example,
// fence-aware so a "###"-looking line inside example source never splits a block.
const splitRenderedExamples = (body) => {
    const section = sectionBody(body, 'Examples');
    if (!section) return [];

    const blocks = [];
    let current = null;
    let inFence = false;
    for (const line of section.split('\n')) {
        if (line.trim().startsWith('```')) inFence = !inFence;
        const heading = !inFence && /^###\s+(.+?)\s*$/.exec(line);
        if (heading) {
            current = { name: heading[1].trim(), lines: [] };
            blocks.push(current);
        } else if (current) {
            current.lines.push(line);
        }
    }
    return blocks.map(({ name, lines }) => ({ name, slug: titleToSlug(name), block: lines.join('\n').trim() }));
};

const mdxMeta = new Map(
    findMdx(primitivesRoot).map((filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
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

// 1. bundled per-component docs + llms-full.txt (offline, no site dependency)
const refsRoot = path.join(skillsRoot, 'radix-ng-examples/references');
for (const section of ['components', 'utils', 'guides', 'recipes', 'examples']) {
    const sectionRoot = path.join(refsRoot, section);
    if (!fs.existsSync(sectionRoot)) continue;

    for (const entry of fs.readdirSync(sectionRoot, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
            fs.rmSync(path.join(sectionRoot, entry.name));
        }
    }
}

for (const doc of docs) {
    write(path.join(refsRoot, doc.section, `${doc.slug}.md`), `${doc.body}\n`);
}

// 1b. Per-example shards: references/examples/<slug>--<example>.md — one file per
// documented example (that example's source + a pointer back to its component doc).
// A consumer agent can (re)load a single example (~few KB) instead of the whole
// component doc; this is the granular unit the recovery protocol reaches for after a
// context compaction. Non-breaking: the full components/<slug>.md doc is unchanged.
let exampleShardCount = 0;
for (const doc of docs.filter((entry) => entry.section === 'components')) {
    const seen = new Set();
    for (const { name, slug, block } of splitRenderedExamples(doc.body)) {
        if (seen.has(slug)) {
            throw new Error(
                `Duplicate example slug "${slug}" in component "${doc.slug}" — two example headings ` +
                    `resolve to the same shard filename. Rename one heading in its .docs.mdx.`
            );
        }
        seen.add(slug);
        const shard = [
            `# ${doc.title} — ${name}`,
            `> One example from the [${doc.title}](../components/${doc.slug}.md) docs — imports, anatomy, and the data-attribute styling contract live there.`,
            `> ${versionLine}`,
            block
        ].join('\n\n');
        write(path.join(refsRoot, 'examples', `${doc.slug}--${slug}.md`), `${shard}\n`);
        exampleShardCount++;
    }
}

const llmsFull = [
    '# Radix NG Primitives — Full Documentation',
    'Unstyled, accessible, signals-first Angular primitives for building design systems and web apps.',
    'Examples use Angular signals and Tailwind CSS v4 utilities; the primitives themselves are styling-agnostic.',
    versionLine,
    ...docs.map((doc) => `---\n\n${doc.body}`)
].join('\n\n');
write(path.join(refsRoot, 'llms-full.txt'), `${llmsFull}\n`);

// llms.txt index (served at SITE_URL/llms.txt) — links to the served per-page Markdown
const sectionTitles = {
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
write(
    path.join(skillsRoot, 'radix-ng/references/styling-contract.json'),
    JSON.stringify({ version: VERSION, primitives: contract }, null, 2) + '\n'
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
  feature to find a working, copy-paste-ready Angular pattern built on the primitives.
  Each component links to a bundled .md file containing the full source of all its examples.
compatibility: Requires @radix-ng/primitives installed in an Angular 21 project.
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

1. Describe the UI you want to build (e.g. "a multi-select combobox", "a form field with validation").
2. Find the matching component below by name and description.
3. Open that component's bundled \`references/components/<slug>.md\` — it lists every example by name
   and has the **full Angular source** of each.
4. Adapt it: keep the primitive directives and \`data-*\` styling hooks, swap in the project's own
   design-system classes/tokens.

To style a primitive with a custom design system, pair an example with the data-attribute contract in
the \`radix-ng\` skill (\`references/styling-contract.json\`).

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
console.log(`✓ styling-contract.json (${contract.length} primitives)`);
console.log(`✓ api-contract.json (${api.parts} parts / ${api.primitives} primitives)`);
console.log(`✓ radix-ng-examples/SKILL.md (${totalExamples} examples / ${componentDocs.length} components)`);
