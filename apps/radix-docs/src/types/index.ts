export interface Page {
    name: string;
    url: string;
}

export interface NavigationItem {
    group: string;
    type: string;
    pages: Page[];
}

export interface SiteConfig {
    navigation: NavigationItem[];
}

import type { CollectionEntry, ContentEntryMap } from 'astro:content';

export type AnyCollectionEntry = CollectionEntry<keyof ContentEntryMap>;

export type CollectionType = keyof ContentEntryMap;
