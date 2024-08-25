import type { MarkdownHeading } from 'astro';

export interface Page {
    name: string;
    url: string;
    label?: string;
}

export interface Section {
    section: string;
    pages: Page[];
}

export interface NavigationItem {
    name: string;
    section: string;
    sections: Section[];
}

export interface SiteConfig {
    navigation: NavigationItem[];
}

export interface TocItem extends MarkdownHeading {
    children: TocItem[];
}
