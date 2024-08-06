export interface Page {
    name: string;
    url: string;
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
