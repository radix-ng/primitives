import type { StorybookConfig } from '@analogjs/storybook-angular';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import remarkGfm from 'remark-gfm';
import { mergeConfig, UserConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
    stories: [
        '../docs/**/*.docs.mdx',
        '../../../packages/primitives/**/*.docs.mdx',
        '../../../packages/primitives/**/*.stories.ts'
    ],

    addons: [
        {
            name: getAbsolutePath('@storybook/addon-docs'),
            options: {
                mdxPluginOptions: {
                    mdxCompileOptions: {
                        remarkPlugins: [remarkGfm]
                    }
                }
            }
        },
        getAbsolutePath('@chromatic-com/storybook')
    ],

    framework: {
        name: '@analogjs/storybook-angular',
        options: {}
    },

    core: {
        disableTelemetry: false
    },

    async viteFinal(config: UserConfig) {
        return mergeConfig(config, {
            plugins: [viteTsConfigPaths()]
        });
    },

    docs: {}
};

export default config;

function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, 'package.json')));
}
