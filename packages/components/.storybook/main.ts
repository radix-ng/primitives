import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
    stories: ['../**/*.docs.mdx', '../**/*.stories.@(js|ts)'],

    addons: [getAbsolutePath("@storybook/addon-docs"), getAbsolutePath("@chromatic-com/storybook")],

    framework: {
        name: getAbsolutePath("@storybook/angular"),
        options: {}
    },

    core: {
        disableTelemetry: false
    },

    docs: {}
};

export default config;

function getAbsolutePath(value: string): any {
    return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
