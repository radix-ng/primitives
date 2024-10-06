import type { SiteConfig } from '@/types';

const docsConfig = {
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
                        { name: 'Code', url: '/themes/typography/code' },
                        { name: 'Kbd', url: '/themes/typography/kbd' }
                    ]
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
                        { name: 'Accordion', url: '/primitives/components/accordion', label: 'New' },
                        { name: 'Avatar', url: '/primitives/components/avatar' },
                        { name: 'Collapsible', url: '/primitives/components/collapsible' },
                        { name: 'Dropdown Menu', url: '/primitives/components/dropdown-menu' },
                        { name: 'Label', url: '/primitives/components/label' }
                    ]
                }
            ]
        }
    ]
} satisfies SiteConfig;

export default docsConfig;
