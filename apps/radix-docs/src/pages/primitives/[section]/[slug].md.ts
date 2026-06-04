import { getStorybookDocByRoute, getStorybookDocs } from '@/utils/storybook-docs';
import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getCollection, getEntry } from 'astro:content';

export async function getStaticPaths() {
    const docEntries = await getCollection('primitives');
    const contentPaths = docEntries.map((page) => ({
        params: { section: page.data.section, slug: page.data.slug },
        props: { id: page.id }
    }));
    const storybookPaths = getStorybookDocs().map((page) => ({
        params: { section: page.section, slug: page.slug },
        props: { id: null }
    }));

    return [...contentPaths, ...storybookPaths].filter(
        (path, index, paths) =>
            paths.findIndex(
                (item) => item.params.section === path.params.section && item.params.slug === path.params.slug
            ) === index
    );
}

export const GET: APIRoute<{ id: CollectionEntry<'primitives'>['id'] | null }> = async ({ params, props }) => {
    const storybookDoc = getStorybookDocByRoute(params.section!, params.slug!);

    if (storybookDoc) {
        return new Response(storybookDoc.body, {
            headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
        });
    }

    if (!props.id) {
        return new Response('Not found', { status: 404 });
    }

    const page = await getEntry('primitives', props.id);

    if (!page) {
        return new Response('Not found', { status: 404 });
    }

    return new Response(page.body, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
    });
};
