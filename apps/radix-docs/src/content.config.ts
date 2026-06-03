import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const docsSchema = z.object({
    title: z.string(),
    slug: z.string(),
    section: z.string()
});

const primitives = defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/primitives' }),
    schema: docsSchema
});

export const collections = { primitives };
