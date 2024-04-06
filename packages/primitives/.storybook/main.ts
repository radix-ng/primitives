import type { StorybookConfig } from '@storybook/angular';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StylexPlugin = require('@stylexjs/webpack-plugin');

const config: StorybookConfig = {
    stories: ['../**/*.stories.@(js|jsx|ts|tsx|mdx)'],

    addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],

    framework: {
        name: '@storybook/angular',
        options: {}
    },

    core: {
        builder: '@storybook/builder-webpack5',
        disableTelemetry: true
    },

    webpackFinal: async (config) => {
        config.plugins = config.plugins || [];
        config.plugins.push(
            new StylexPlugin({
                filename: 'styles.[contenthash].css',
                dev: config.mode === 'development',
                runtimeInjection: false,
                classNamePrefix: 'x',
                unstable_moduleResolution: {
                    type: 'commonJS',
                    rootDir: __dirname
                }
            })
        );
        return config;
    },

    docs: {
        autodocs: true
    }
};

export default config;
