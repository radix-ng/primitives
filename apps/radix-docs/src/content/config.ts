import { defineCollection, z } from 'astro:content';
import { COLLECTION_TYPES } from '../config/site-config.ts';

const docsSchema = z.object({
    title: z.string()
});

export type DocsSchema = z.infer<typeof docsSchema>;

export const collections = Object.fromEntries(
    COLLECTION_TYPES.map((type) => [
        type,
        defineCollection({ schema: docsSchema })
    ])
);
