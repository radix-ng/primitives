import path from 'node:path';
import { markdownHeadings, markdownLinks, rewriteMarkdownLinks } from './markdown-links.mjs';

const exampleSlug = (title) =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
const pagePath = (doc) => `${doc.section}/${doc.slug}.md`;
const sections = (body) => {
    const headings = markdownHeadings(body).filter(({ depth }) => depth === 2);
    return headings.map((heading, index) => ({ ...heading, end: headings[index + 1]?.start ?? body.length }));
};

function splitExamples(doc) {
    const section = sections(doc.body).find(({ title }) => title === 'Examples');
    if (!section) return [];
    const headings = markdownHeadings(doc.body).filter(
        ({ depth, start }) => depth === 3 && start > section.start && start < section.end
    );
    return headings.map((heading, index) => ({
        ...heading,
        file: `examples/${doc.slug}--${exampleSlug(heading.title)}.md`,
        block: doc.body.slice(heading.end, headings[index + 1]?.start ?? section.end).trim()
    }));
}

function componentIndex(doc, examples, retained, versionLine, meta) {
    const selected = sections(doc.body)
        .filter(({ title, start }) => ['Features', 'Import', 'Anatomy'].includes(title) || retained.has(start))
        .map(({ start, end }) => doc.body.slice(start, end).trim());
    const links = examples.map(({ title, file }) => {
        const description = meta.examples?.find(({ name }) => name === title)?.description;
        return `- [${title}](../${file})${description ? ` — ${description}` : ''}`;
    });
    return [
        `# ${doc.title}`,
        doc.description,
        `> Index — full source of each example is one click away in \`../examples/${doc.slug}--*.md\`; the whole-doc dump is in \`../llms-full.txt\`.`,
        `> ${versionLine}`,
        ...selected,
        links.length ? `## Examples\n\n${links.join('\n')}` : '',
        '## API & styling contract',
        `Machine-readable contracts for this primitive live in the \`radix-ng\` skill:\n` +
            `- API (selectors, inputs, outputs, two-way bindings): \`references/api-contract/${doc.slug}.json\`\n` +
            `- Styling (parts + \`data-*\`): \`references/styling-contract/${doc.slug}.json\``
    ]
        .filter(Boolean)
        .join('\n\n');
}

export function createMarkdownBundle(docs, { versionLine, metaFor = () => ({}) }) {
    const sources = new Map(docs.map((doc) => [pagePath(doc), doc]));
    const routes = new Map(docs.map((doc) => [doc.storybookId, pagePath(doc)]));
    const examples = new Map(
        docs.filter(({ section }) => section === 'components').map((doc) => [pagePath(doc), splitExamples(doc)])
    );
    const exampleTargets = new Map();
    const exampleSources = new Map();
    const files = new Map();
    for (const [page, blocks] of examples) {
        for (const { title, id, file, block } of blocks) {
            if (files.has(file)) throw new Error(`Duplicate example slug: ${file}`);
            const doc = sources.get(page);
            files.set(
                file,
                [
                    `# ${doc.title} — ${title}`,
                    `> One example from the [${doc.title}](../${page}) index — imports, anatomy, and links to the API and styling contracts are there.`,
                    `> ${versionLine}`,
                    block
                ].join('\n\n')
            );
            exampleTargets.set(`${page}#${id}`, file);
            exampleSources.set(file, page);
        }
    }

    const resolveLink = (source, url) => {
        const storybook = /^(?:\.\/|\/)?\?path=\/docs\/([\w-]+)--docs(?:#(.*))?$/.exec(url);
        if (storybook) {
            const page = routes.get(storybook[1]);
            if (!page) throw new Error(`${source}: unknown Storybook page ${url}`);
            return { page, fragment: storybook[2] };
        }
        if (/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(url)) return undefined;
        const [target, fragment] = url.split('#');
        if (target && !target.endsWith('.md')) return undefined;
        return {
            page: target ? path.posix.normalize(path.posix.join(path.posix.dirname(source), target)) : source,
            fragment
        };
    };

    // Preserve only linked narrative sections that the compact component index would omit.
    const retained = new Map([...examples.keys()].map((page) => [page, new Set()]));
    for (const doc of docs) {
        for (const { url } of markdownLinks(doc.body)) {
            const target = resolveLink(pagePath(doc), url);
            if (
                !target?.fragment ||
                !retained.has(target.page) ||
                exampleTargets.has(`${target.page}#${decodeURIComponent(target.fragment)}`)
            )
                continue;
            const source = sources.get(target.page);
            const heading = markdownHeadings(source.body).find(({ id }) => id === decodeURIComponent(target.fragment));
            const section =
                heading &&
                sections(source.body).find(({ start, end }) => heading.start >= start && heading.start < end);
            if (section && section.title !== 'Examples') retained.get(target.page).add(section.start);
        }
    }
    for (const doc of docs) {
        const page = pagePath(doc);
        files.set(
            page,
            doc.section === 'components'
                ? componentIndex(doc, examples.get(page), retained.get(page), versionLine, metaFor(doc))
                : doc.body
        );
    }

    const rewrite = (body, source, destination) =>
        rewriteMarkdownLinks(body, (url) => {
            const target = resolveLink(source, url);
            if (!target) return url;
            const example = exampleTargets.get(`${target.page}#${decodeURIComponent(target.fragment ?? '')}`);
            const page = example ?? target.page;
            const fragment = !example && target.fragment ? `#${target.fragment}` : '';
            return page === destination && fragment
                ? fragment
                : path.posix.relative(path.posix.dirname(destination), page) + fragment;
        });
    for (const [file, body] of files) {
        // Extracted example prose still resolves relative links in its original component page.
        const source = exampleSources.get(file) ?? file;
        files.set(file, rewrite(body, source, file));
    }
    return {
        files,
        exampleShardCount: [...examples.values()].reduce((count, blocks) => count + blocks.length, 0),
        fullDocs: docs.map((doc) => rewrite(doc.body, pagePath(doc), 'llms-full.txt'))
    };
}
