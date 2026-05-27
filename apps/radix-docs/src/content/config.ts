import { defineCollection, z } from 'astro:content';

const docsSchema = z.object({
    title: z.string(),
    section: z.string()
});

const primitives = defineCollection({
    schema: docsSchema
});

export const collections = { primitives };
