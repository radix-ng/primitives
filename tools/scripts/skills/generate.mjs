/**
 * Generates the LLM-facing consumer skills from the Storybook docs — the single source of
 * truth for examples and the data-attribute styling contract. Fully self-contained: the
 * skills bundle the rendered docs offline and do NOT depend on any deployed site.
 *
 *   node tools/scripts/skills/generate.mjs
 *
 * Outputs (do not edit by hand — regenerated):
 *   skills/radix-ng/references/styling-contract.json     parts + data-* per primitive
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
import { getStorybookDocs } from './storybook-docs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../../..');
const primitivesRoot = path.join(workspaceRoot, 'packages/primitives');
const skillsRoot = path.join(workspaceRoot, 'skills');

// Storybook is served on the main domain and also serves the LLM docs bundle as static files
// (see apps/radix-storybook/.storybook/main.ts staticDirs): /llms.txt, /llms-full.txt, /<section>/<slug>.md.
const SITE_URL = 'https://radix-ng.com';

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
    if (packageName === 'primitives' || packageName === 'core' || fileName === 'sheet') {
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
for (const doc of docs) {
    write(path.join(refsRoot, doc.section, `${doc.slug}.md`), `${doc.body}\n`);
}

const llmsFull = [
    '# Radix NG Primitives — Full Documentation',
    'Unstyled, accessible, signals-first Angular primitives for building design systems and web apps.',
    'Examples use Angular signals and Tailwind CSS v4 utilities; the primitives themselves are styling-agnostic.',
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
    JSON.stringify({ primitives: contract }, null, 2) + '\n'
);

// 3. examples index skill
const componentDocs = docs.filter((doc) => doc.section === 'components' && (metaFor(doc).examples ?? []).length);
const totalExamples = componentDocs.reduce((sum, doc) => sum + metaFor(doc).examples.length, 0);

const indexBody = componentDocs
    .map((doc) => {
        const items = metaFor(doc)
            .examples.map((ex) => `- **${ex.name}**${ex.description ? ` — ${ex.description}` : ''}`)
            .join('\n');
        return `### ${doc.title}\n\nFull source (all examples): [\`references/components/${doc.slug}.md\`](./references/components/${doc.slug}.md) · [Storybook](${SITE_URL}/?path=/docs/primitives-${doc.slug}--docs)\n\n${items}`;
    })
    .join('\n\n');

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

Working examples built on \`@radix-ng/primitives\`. Full source is **bundled offline** under
\`references/\`; browse visually at ${SITE_URL}.

## How to use this skill

1. Describe the UI you want to build (e.g. "a multi-select accordion", "a form field with validation").
2. Find the matching component below and scan its example list.
3. Open the component's bundled \`references/components/<name>.md\` — it has the **full Angular source**
   of every example.
4. Adapt it: keep the primitive directives and \`data-*\` styling hooks, swap in the project's own
   design-system classes/tokens.

To style a primitive with a custom design system, pair an example with the data-attribute contract in
the \`radix-ng\` skill (\`references/styling-contract.json\`).

Total: **${totalExamples} examples** across **${componentDocs.length} components**.

## Components

${indexBody}
`;
write(path.join(skillsRoot, 'radix-ng-examples/SKILL.md'), examplesSkill);

console.log(`✓ ${docs.length} docs rendered → ${path.relative(workspaceRoot, refsRoot)}/<section>/`);
console.log(`✓ llms.txt + llms-full.txt (${docs.length} docs)`);
console.log(`✓ styling-contract.json (${contract.length} primitives)`);
console.log(`✓ radix-ng-examples/SKILL.md (${totalExamples} examples / ${componentDocs.length} components)`);
