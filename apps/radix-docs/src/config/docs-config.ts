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
                        { name: 'Avatar', url: '/themes/components/avatar' },
                        { name: 'Switch', url: '/themes/components/switch' }
                    ]
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
                        { name: 'Getting started', url: '/primitives/overview/getting-started' },
                        { name: 'Accessibility', url: '/primitives/overview/accessibility' },
                        { name: 'Styling', url: '/primitives/overview/styling' },
                        { name: 'Contribute', url: '/primitives/overview/contribute' }
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
                        { name: 'Accordion', url: '/primitives/components/accordion' },
                        { name: 'Alert Dialog', url: '#', label: 'Storybook' },
                        { name: 'Aspect Ratio', url: '/primitives/components/aspect-ratio' },
                        { name: 'Avatar', url: '/primitives/components/avatar' },
                        { name: 'Checkbox', url: '#', label: 'Storybook' },
                        { name: 'Collapsible', url: '/primitives/components/collapsible' },
                        { name: 'Context Menu', url: '#', label: 'Storybook' },
                        { name: 'Dialog', url: '/primitives/components/dialog' },
                        { name: 'Dropdown Menu', url: '/primitives/components/dropdown-menu' },
                        { name: 'Label', url: '/primitives/components/label' },
                        { name: 'Popover', url: '#', label: 'Storybook' },
                        { name: 'Progress', url: '/primitives/components/progress' },
                        { name: 'Radio Group', url: '#', label: 'Storybook' },
                        { name: 'Select', url: '/primitives/components/select' },
                        { name: 'Separator', url: '/primitives/components/separator' },
                        { name: 'Slider', url: '/primitives/components/slider', label: 'New' },
                        { name: 'Switch', url: '/primitives/components/switch' },
                        { name: 'Tabs', url: '#', label: 'Storybook' },
                        { name: 'Toggle', url: '/primitives/components/toggle' },
                        { name: 'Toggle Group', url: '#', label: 'Storybook' },
                        { name: 'Tooltip', url: '#', label: 'Storybook' }
                    ]
                }
            ]
        }
    ]
} satisfies SiteConfig;

export default docsConfig;
