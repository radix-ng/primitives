import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
    const posts = await getCollection('primitives');

    let content = '# RadixNG Angular\n\n';
    for (const post of posts) {
        content += `${post.body}\n\n`;
    }

    return new Response(content, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
};
