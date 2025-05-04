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
                        { name: 'Dates', url: '/primitives/overview/dates' },
                        { name: 'Numbers', url: '/primitives/overview/numbers' },
                        { name: 'Inject Context', url: '/primitives/overview/inject-context' },
                        { name: 'Contribute', url: '/primitives/overview/contribute' }
                    ]
                },
                {
                    section: 'Storybook',
                    pages: [
                        { name: 'Primitives', url: 'https://sb-primitives.radix-ng.com', external: true }]
                },
                {
                    section: 'Date',
                    pages: [
                        {
                            name: 'Calendar',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-calendar--docs',
                            label: 'Storybook'
                        },
                        {
                            name: 'Date Field',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-date-field--docs',
                            label: 'Storybook'
                        }
                    ]
                },
                {
                    section: 'Components',
                    pages: [
                        { name: 'Accordion', url: '/primitives/components/accordion' },
                        {
                            name: 'Alert Dialog',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-alert-dialog--docs',
                            label: 'Storybook'
                        },
                        { name: 'Aspect Ratio', url: '/primitives/components/aspect-ratio' },
                        { name: 'Avatar', url: '/primitives/components/avatar' },
                        { name: 'Checkbox', url: '/primitives/components/checkbox' },
                        { name: 'Collapsible', url: '/primitives/components/collapsible' },
                        {
                            name: 'Context Menu',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-context-menu--docs',
                            label: 'Storybook'
                        },
                        { name: 'Dialog', url: '/primitives/components/dialog' },
                        { name: 'Dropdown Menu', url: '/primitives/components/dropdown-menu' },
                        { name: 'Label', url: '/primitives/components/label' },
                        {
                            name: 'Menubar',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-menubar--docs',
                            label: 'Storybook'
                        },
                        {
                            name: 'Navigation Menu',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-navigation-menu--docs',
                            label: 'Storybook'
                        },
                        {
                            name: 'Number Field',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-number-field--docs',
                            label: 'Storybook'
                        },
                        {
                            name: 'Pagination',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-pagination--docs',
                            label: 'Storybook'
                        },
                        {
                            name: 'Popover',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-popover--docs',
                            label: 'Storybook'
                        },
                        { name: 'Progress', url: '/primitives/components/progress' },
                        {
                            name: 'Radio Group',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-radio-group--docs',
                            label: 'Storybook'
                        },
                        { name: 'Select', url: '/primitives/components/select' },
                        { name: 'Separator', url: '/primitives/components/separator' },
                        { name: 'Slider', url: '/primitives/components/slider', label: 'New' },
                        {
                            name: 'Stepper',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-stepper--docs',
                            label: 'Storybook'
                        },
                        { name: 'Switch', url: '/primitives/components/switch' },
                        {
                            name: 'Tabs',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-tabs--docs',
                            label: 'Storybook'
                        },
                        { name: 'Toggle', url: '/primitives/components/toggle' },
                        { name: 'Toggle Group', url: '/primitives/components/toggle-group' },
                        {
                            name: 'Toolbar',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-toolbar--docs',
                            label: 'Storybook'
                        },
                        {
                            name: 'Tooltip',
                            url: 'https://sb-primitives.radix-ng.com/?path=/docs/primitives-tooltip--docs',
                            label: 'Storybook'
                        }
                    ]
                }
            ]
        }
    ]
} satisfies SiteConfig;

export default docsConfig;
