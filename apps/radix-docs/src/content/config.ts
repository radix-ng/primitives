import { defineCollection, z } from 'astro:content';

const docsSchema = z.object({
    title: z.string(),
    section: z.string()
});

const themesSchema = z.object({
    title: z.string(),
    section: z.string()
});

const themes = defineCollection({
    schema: themesSchema
});

const primitives = defineCollection({
    schema: docsSchema
});

export const collections = { themes, primitives };
