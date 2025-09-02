import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from '@storybook/angular';
import remarkGfm from 'remark-gfm';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
    stories: [
        '../docs/**/*.docs.mdx',
        '../../../packages/primitives/**/*.docs.mdx',
        '../../../packages/primitives/**/*.stories.@(js|ts)'
    ],

    addons: [{
        name: getAbsolutePath("@storybook/addon-docs"),
        options: {
            mdxPluginOptions: {
                mdxCompileOptions: {
                    remarkPlugins: [remarkGfm]
                }
            }
        }
    }, getAbsolutePath("@chromatic-com/storybook")],

    framework: {
        name: getAbsolutePath("@storybook/angular"),
        options: {}
    },

    core: {
        disableTelemetry: true
    },

    docs: {}
};

export default config;

function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, "package.json")));
}
