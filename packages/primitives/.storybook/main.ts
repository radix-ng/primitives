import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
    stories: ['../.docs/**/*.docs.mdx', '../**/*.docs.mdx', '../**/*.stories.@(js|ts)'],

    addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-docs',
        {
            name: '@storybook/addon-storysource',
            options: {
                sourceLoaderOptions: {
                    injectStoryParameters: false
                }
            }
        },
        '@storybook/addon-backgrounds',
        '@chromatic-com/storybook'
    ],

    framework: {
        name: '@storybook/angular',
        options: {}
    },

    core: {
        disableTelemetry: true
    }
};

export default config;
