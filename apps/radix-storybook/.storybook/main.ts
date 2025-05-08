import type { StorybookConfig } from '@storybook/angular';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
    stories: [
        '../docs/**/*.docs.mdx',
        '../../../packages/primitives/**/*.docs.mdx',
        '../../../packages/primitives/**/*.stories.@(js|ts)'
    ],

    addons: [
        '@storybook/addon-essentials',
        {
            name: '@storybook/addon-docs',
            options: {
                mdxPluginOptions: {
                    mdxCompileOptions: {
                        remarkPlugins: [remarkGfm]
                    }
                }
            }
        },
        {
            name: '@storybook/addon-storysource',
            options: {
                sourceLoaderOptions: {
                    injectStoryParameters: false
                }
            }
        },
        '@storybook/addon-backgrounds',
        '@chromatic-com/storybook',
        '@storybook/addon-mdx-gfm'

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
