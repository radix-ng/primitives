import type { SiteConfig } from '../types';

const siteConfig = {
    navigation: [
        {
            name: 'Theme',
            section: 'themes',
            sections: [
                {
                    section: 'Overview',
                    pages: [
                        { name: 'Introduction', url: '/themes/overview/introduction' },
                        { name: 'Installation', url: '/themes/overview/installation' },
                        { name: 'Component', url: '/themes/overview/custom-component' }
                    ]
                },
                {
                    section: 'Theme',
                    pages: [
                        { name: 'Overview', url: '/themes/theme/overview' }]
                }
            ]
        },
        {
            name: 'Primitives',
            section: 'primitives',
            sections: [
                {
                    section: 'Overview',
                    pages: [
                        { name: 'Introduction', url: '/' },
                        { name: 'Installation', url: '/overview/installation' },
                        { name: 'Component', url: '/overview/custom-component' }
                    ]
                }
            ]
        }
    ]
} satisfies SiteConfig;

export default siteConfig;
