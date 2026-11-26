// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from '@analogjs/storybook-angular';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import remarkGfm from 'remark-gfm';
import { mergeConfig, type UserConfig } from 'vite';

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
        getAbsolutePath('@storybook/addon-a11y'),
        getAbsolutePath('@chromatic-com/storybook')
    ],

    framework: {
        name: getAbsolutePath('@analogjs/storybook-angular'),
        options: {}
    },

    core: {
        disableTelemetry: false
    },

    features: {
        backgrounds: false
    },

    async viteFinal(config: UserConfig) {
        return mergeConfig(config, {
            resolve: { tsconfigPaths: true },
            // Storybook's Angular ArgTypes tables match a component to its compodoc entry by the
            // runtime class `.name` (`findComponentByName`). The production build minifies with
            // Rolldown/Oxc, whose name mangling renames every directive class (`RdxSwitchRoot` → `k`)
            // and leaves `.name` mangled, so *every* `<ArgTypes of={Directive} />` silently resolves to
            // nothing on the built/deployed site (the dev server doesn't minify, so it looks fine
            // locally — hence "compodoc generated nothing" is a false lead). The AnalogJS builder's
            // `oxc: { keepNames: true }` only covers the per-file transform pass, not this output-minify
            // pass, so we pin the Oxc minifier to keep class/function names. `compress`/`codegen` stay
            // on so only the identifier renaming of names is relaxed.
            build: {
                rollupOptions: {
                    output: {
                        minify: {
                            compress: true,
                            codegen: true,
                            mangle: { keepNames: { function: true, class: true } }
                        }
                    }
                }
            }
        });
    },

    // Serve the generated LLM docs bundle (tools/scripts/skills) at Storybook's base, so
    // /llms.txt, /llms-full.txt, and /<section>/<slug>.md are available for LLM consumers.
    staticDirs: [
        '../public',
        { from: '../../../skills/radix-ng-examples/references', to: '/' },
        { from: '../../../skills/radix-ng/references/api-contract', to: '/api-contract' },
        { from: '../../../skills/radix-ng/references/styling-contract', to: '/styling-contract' }
    ],

    docs: {}
};

export default config;

function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, 'package.json')));
}
