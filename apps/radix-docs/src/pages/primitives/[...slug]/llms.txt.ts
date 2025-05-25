export const prerender = false;

import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';

export const GET: APIRoute = async ({ params }) => {
    const raw = params.slug as string;
    const segments = raw.split('/');
    const slug = segments[segments.length - 1];

    try {
        const entry = await getEntry('primitives', slug);
        const body = `${entry.body}\n`;
        return new Response(body, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    } catch {
        return new Response('Not Found', { status: 404 });
    }
};
