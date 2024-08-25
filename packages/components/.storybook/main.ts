import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
    stories: ['../**/*.docs.mdx', '../**/*.stories.@(js|ts)'],

    addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-docs',
        '@storybook/addon-backgrounds',
        '@chromatic-com/storybook'
    ],

    framework: {
        name: '@storybook/angular',
        options: {}
    },

    core: {
        disableTelemetry: true
    },

    docs: {}
};

export default config;
