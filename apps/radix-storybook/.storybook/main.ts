// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from '@analogjs/storybook-angular';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import remarkGfm from 'remark-gfm';
import { mergeConfig, Plugin, UserConfig } from 'vite';

const require = createRequire(import.meta.url);

/**
 * Loads `*.ts?raw` imports as plain text.
 *
 * Vite's built-in `?raw` loader is shadowed by the AnalogJS Angular plugin,
 * which compiles `.ts` files. We resolve `?raw` ids to a virtual `\0`-prefixed
 * module (ignored by other plugins) and return the file contents, so stories can
 * show their full component source in the "Show code" panel.
 */
function rawTsPlugin(): Plugin {
    // Opaque virtual ids (no `.ts` suffix) so the esbuild/Angular transforms
    // don't touch the generated module and strip its default export.
    const rawModules = new Map<string, string>();
    let counter = 0;

    return {
        name: 'rdx-raw-ts',
        enforce: 'pre',
        async resolveId(id, importer) {
            if (!id.endsWith('?raw')) {
                return null;
            }
            const resolved = await this.resolve(id.slice(0, -'?raw'.length), importer, { skipSelf: true });
            // Only take over `.ts?raw`; leave other raw assets to Vite.
            if (!resolved || !resolved.id.endsWith('.ts')) {
                return null;
            }
            const virtualId = `\0raw-${counter++}`;
            rawModules.set(virtualId, resolved.id);
            return virtualId;
        },
        async load(id) {
            const file = rawModules.get(id);
            if (!file) {
                return null;
            }
            const code = await readFile(file, 'utf-8');
            return `export default ${JSON.stringify(code)};`;
        }
    };
}

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
            },
            plugins: [rawTsPlugin()]
        });
    },

    // Serve the generated LLM docs bundle (tools/scripts/skills) at the deploy root, so
    // /llms.txt, /llms-full.txt, and /<section>/<slug>.md are available for LLM consumers.
    staticDirs: ['../public', { from: '../../../skills/radix-ng-examples/references', to: '/' }],

    docs: {}
};

export default config;

function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, 'package.json')));
}
