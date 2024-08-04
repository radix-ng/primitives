import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    navigation: [
        {
            group: 'Overview',
            type: 'overview',
            pages: [
                { name: 'Introduction', url: '/' },
                { name: 'Installation', url: '/overview/installation' },
                { name: 'Component', url: '/overview/custom-component' }
            ]
        },
        {
            group: 'Theme',
            type: 'theme',
            pages: []
        },
        {
            group: 'Components',
            type: 'components',
            pages: []
        }
    ]
};

export const COLLECTION_TYPES = siteConfig.navigation.map((nav) => nav.type);

export default siteConfig;
