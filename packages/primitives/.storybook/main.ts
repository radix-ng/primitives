import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
    stories: ['../.docs/**/*.docs.mdx', '../**/*.docs.mdx', '../**/*.stories.@(js|ts)'],

    addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-docs',
        '@storybook/addon-backgrounds',
        '@geometricpanda/storybook-addon-badges'
    ],

    framework: {
        name: '@storybook/angular',
        options: {}
    },

    core: {
        builder: '@storybook/builder-webpack5',
        disableTelemetry: true
    }
};

export default config;
