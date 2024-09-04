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
                        { name: 'Getting started', url: '/themes/overview/getting-started' },
                        { name: 'Styling', url: '/themes/overview/styling' }
                    ]
                },
                {
                    section: 'Theme',
                    pages: [
                        { name: 'Overview', url: '/themes/theme/overview' }]
                },
                {
                    section: 'Typography',
                    pages: [
                        { name: 'Kbd', url: '/themes/typography/kbd' }]
                },
                {
                    section: 'Components',
                    pages: [
                        { name: 'Avatar', url: '/themes/components/avatar' }]
                },
                {
                    section: 'Utilities',
                    pages: [
                        { name: 'Theme', url: '/themes/utilities/theme' }]
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
                        { name: 'Introduction', url: '/primitives/overview/introduction' },
                        { name: 'Getting started', url: '/primitives/overview/getting-started' }
                    ]
                },
                {
                    section: 'Storybook',
                    pages: [
                        { name: 'Primitives', url: 'https://sb-primitives.radix-ng.com', external: true }]
                },
                {
                    section: 'Components',
                    pages: [
                        { name: 'Avatar', url: '/primitives/components/avatar', label: 'New' },
                        { name: 'Collapsible', url: '/primitives/components/collapsible' },
                        { name: 'Label', url: '/primitives/components/label' }
                    ]
                }
            ]
        }
    ]
} satisfies SiteConfig;

export default siteConfig;
