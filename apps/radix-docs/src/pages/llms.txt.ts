import docsConfig from '@/config/docs-config';
import { siteConfig } from '@/config/site-config';
import { getStorybookDocs } from '@/utils/storybook-docs';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
    const pages = await getCollection('primitives');
    const pagesByPath = new Map(
        pages.map((page) => [`/primitives/${page.data.section}/${page.data.slug}`, page] as const)
    );

    const origin = siteConfig.url.replace(/\/$/, '');
    const overviewSections = docsConfig.navigation
        .flatMap((item) => item.sections)
        .filter((section) => section.section === 'Overview')
        .map((section) => {
            const links = section.pages
                .map((page) => {
                    if (page.external) {
                        return `- [${page.name}](${page.url}): External documentation.`;
                    }

                    const entry = pagesByPath.get(page.url);
                    if (!entry) {
                        return null;
                    }

                    const description =
                        entry.data.description && entry.data.description !== '.'
                            ? entry.data.description
                            : entry.data.title;
                    return `- [${page.name}](${origin}${page.url}.md): ${description}`;
                })
                .filter(Boolean);

            return links.length ? `## ${section.section}\n\n${links.join('\n')}` : null;
        })
        .filter(Boolean);
    const storybookSections = Array.from(
        getStorybookDocs().reduce((groups, doc) => {
            const docs = groups.get(doc.group) ?? [];
            groups.set(doc.group, [...docs, doc]);
            return groups;
        }, new Map<string, ReturnType<typeof getStorybookDocs>>())
    ).map(([group, docs]) => {
        const links = docs.map(
            (doc) => `- [${doc.title}](${origin}/primitives/${doc.section}/${doc.slug}.md): ${doc.description}`
        );
        return `## ${group}\n\n${links.join('\n')}`;
    });

    const content = [
        `# ${siteConfig.title}`,
        siteConfig.description,
        'This is the documentation for the `@radix-ng/primitives` package. It contains unstyled, accessible Angular primitives for building design systems and web apps. The examples use Angular signals and Tailwind CSS v4 utilities where applicable.',
        ...overviewSections,
        ...storybookSections
    ].join('\n\n');

    return new Response(content, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
};
