import { defineCollection, z } from 'astro:content';

const docsSchema = z.object({
    title: z.string(),
    section: z.string(),
    slug: z.string()
});

const themes = defineCollection({
    schema: docsSchema
});

const primitives = defineCollection({
    schema: docsSchema
});

export const collections = { themes, primitives };
