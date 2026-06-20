/**
 * Generates the playground mascot local docs index from the same rendered docs
 * bundle used by the LLM-facing skills.
 *
 *   node tools/scripts/playground/generate-mascot-docs.mjs
 *
 * Output:
 *   apps/radix-playground/src/app/playground-mascot/playground-mascot-docs.generated.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../../..');
const componentDocsRoot = path.join(workspaceRoot, 'skills/radix-ng-examples/references/components');
const storybookDocsRoot = path.join(workspaceRoot, 'apps/radix-storybook/docs');
const outputFile = path.join(
    workspaceRoot,
    'apps/radix-playground/src/app/playground-mascot/playground-mascot-docs.generated.ts'
);

const playgroundPrimitives = new Set([
    'accordion',
    'checkbox',
    'dialog',
    'popover',
    'select',
    'slider',
    'switch',
    'tabs'
]);
const storybookDocSections = new Set(['guides', 'learn', 'overview']);

const read = (filePath) => fs.readFileSync(filePath, 'utf8');

const listFiles = (dir, predicate) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return listFiles(fullPath, predicate);
        return entry.isFile() && predicate(fullPath) ? [fullPath] : [];
    });

const slugToTitle = (slug) =>
    slug
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

const cleanInlineMarkdown = (value) =>
    value
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/[`*_]/g, '')
        .replace(/^[-\s✅]+/, '')
        .replace(/\s+/g, ' ')
        .trim();

const removeCodeBlocks = (value) => value.replace(/```[\s\S]*?```/g, ' ');

const getHeading = (content, level, title) => {
    const pattern = new RegExp(`^${'#'.repeat(level)}\\s+${title}\\s*$`, 'im');
    const match = pattern.exec(content);
    if (!match) return '';
    const rest = content.slice(match.index + match[0].length);
    const next = /^#{1,6}\s+/m.exec(rest);
    return (next ? rest.slice(0, next.index) : rest).trim();
};

const firstParagraphAfterTitle = (content) => {
    const title = /^#\s+.+$/m.exec(content);
    if (!title) return '';
    const rest = content.slice(title.index + title[0].length);
    const paragraphs = rest
        .split(/\n\s*\n/)
        .map((part) => cleanInlineMarkdown(part.replace(/^####\s+/m, '')))
        .filter((part) => part && !part.startsWith('import ') && !part.startsWith('<Meta') && !part.startsWith('```'));

    return paragraphs[0] ?? '';
};

const extractTitle = (content, fallback) => {
    const h1 = /^#\s+(.+)$/m.exec(content)?.[1];
    if (h1) return cleanInlineMarkdown(h1);

    const metaTitle = /<Meta\b[^>]*title=["']([^"']+)["'][^>]*\/?>/m.exec(content)?.[1];
    if (metaTitle) return cleanInlineMarkdown(metaTitle.split('/').at(-1) ?? metaTitle);

    return fallback;
};

const extractSummary = (content) => {
    const subtitle = /^####\s+(.+)$/m.exec(content)?.[1];
    if (subtitle) return cleanInlineMarkdown(subtitle);

    const metaDescription = /description=["']([^"']+)["']/m.exec(content)?.[1];
    if (metaDescription) return cleanInlineMarkdown(metaDescription);

    return firstParagraphAfterTitle(content);
};

const extractFeatures = (content) => {
    const features = getHeading(content, 2, 'Features');
    if (!features) return [];

    return features
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('- '))
        .map(cleanInlineMarkdown)
        .filter(Boolean)
        .slice(0, 3);
};

const extractHeadingBullets = (content) =>
    [...removeCodeBlocks(content).matchAll(/^##\s+(.+)$/gm)]
        .map((match) => cleanInlineMarkdown(match[1]))
        .filter((heading) => heading && heading !== 'Features' && heading !== 'Import' && heading !== 'Anatomy')
        .slice(0, 3)
        .map((heading) => `Covers ${heading}.`);

const words = (value) =>
    cleanInlineMarkdown(value)
        .toLowerCase()
        .replace(/[^a-z0-9а-яё-]+/gi, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2);

const uniq = (items) => [...new Set(items)];

const keywordsFor = ({ slug, title, summary, bullets, content }) =>
    uniq([
        slug,
        ...slug.split('-'),
        ...words(title),
        ...words(summary),
        ...words(bullets.join(' ')),
        ...words([...removeCodeBlocks(content).matchAll(/^#{2,3}\s+(.+)$/gm)].map((match) => match[1]).join(' '))
    ]).slice(0, 48);

const componentEntry = (filePath) => {
    const slug = path.basename(filePath, '.md');
    const content = read(filePath);
    const title = extractTitle(content, slugToTitle(slug));
    const summary = extractSummary(content);
    const features = extractFeatures(content);
    const bullets = features.length ? features : extractHeadingBullets(content);

    return {
        id: `component-${slug}`,
        primitive: slug,
        title,
        summary,
        bullets,
        keywords: keywordsFor({ slug, title, summary, bullets, content }),
        href: `/docs/?path=/docs/primitives-${slug}--docs`,
        ...(playgroundPrimitives.has(slug) ? { exampleHref: `/playground/${slug}` } : {}),
        source: 'Docs'
    };
};

const storybookEntry = (filePath) => {
    const section = path.basename(path.dirname(filePath));
    const slug = path.basename(filePath, '.docs.mdx');
    const content = read(filePath);
    const title = extractTitle(content, slugToTitle(slug));
    const summary = extractSummary(content);
    const bullets = extractHeadingBullets(content);

    return {
        id: `${section}-${slug}`,
        title,
        summary,
        bullets,
        keywords: keywordsFor({ slug, title, summary, bullets, content }),
        href: `/docs/?path=/docs/${section}-${slug}--docs`,
        source: section === 'guides' ? 'Guide' : 'Docs'
    };
};

const componentEntries = listFiles(componentDocsRoot, (filePath) => filePath.endsWith('.md')).map(componentEntry);

const storybookEntries = listFiles(storybookDocsRoot, (filePath) => filePath.endsWith('.docs.mdx'))
    .filter((filePath) => storybookDocSections.has(path.basename(path.dirname(filePath))))
    .map(storybookEntry);

const entries = [...componentEntries, ...storybookEntries].sort((a, b) => a.id.localeCompare(b.id));

const output = `// Auto-generated by tools/scripts/playground/generate-mascot-docs.mjs.
// Do not edit this file by hand.
import type { MascotDocsEntry } from './playground-mascot-data';

export const MASCOT_DOCS_INDEX: readonly MascotDocsEntry[] = ${JSON.stringify(entries, null, 4)};
`;

const prettier = await import('prettier');
const prettierConfig = (await prettier.resolveConfig(outputFile)) ?? {};
const formattedOutput = await prettier.format(output, { ...prettierConfig, parser: 'typescript' });

fs.writeFileSync(outputFile, formattedOutput);

console.log(`Generated ${path.relative(workspaceRoot, outputFile)} (${entries.length} entries)`);
