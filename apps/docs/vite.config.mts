/// <reference types="vitest" />

import analog from '@analogjs/platform';
import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import replace from '@rollup/plugin-replace';
import * as path from 'path';
import {typescriptPaths} from 'rollup-plugin-typescript-paths';
import {visualizer} from 'rollup-plugin-visualizer';
import {defineConfig, Plugin} from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    return {
        root: __dirname,
        publicDir: 'src/assets',
        optimizeDeps: {
            include: ['@angular/common', '@angular/forms', 'isomorphic-fetch']
        },
        ssr: {
            noExternal: ['@radix-ng/**', '@angular/cdk/**', '@ng-icons/**']
        },
        build: {
            outDir: '../../dist/apps/docs/client',
            reportCompressedSize: true,
            commonjsOptions: {transformMixedEsModules: true},
            target: ['es2020']
        },
        resolve: {
            alias: {
                '~': path.resolve(__dirname, './src')
            }
        },
        plugins: [
            replace({
                preventAssignment: true,
                'http://127.0.0.1:4200': 'https://radix-ng.com',
                __LASTMOD__: new Date().toISOString()
            }),
            analog({
                prerender: {
                    routes: [
                        '/',

                        '/documentation/introduction',
                        '/documentation/about',
                        '/documentation/cli',

                        '/components/checkbox',
                        '/components/label'
                    ],
                    sitemap: {
                        host: 'https://radix-ng.com'
                    }
                },
                nitro: {
                    rollupConfig: {
                        plugins: [
                            typescriptPaths({
                                tsConfigPath: 'tsconfig.base.json',
                                preserveExtensions: true
                            })
                        ]
                    }
                }
            }),
            nxViteTsPaths(),
            visualizer() as Plugin

        ],
        test: {
            reporters: ['default'],
            coverage: {
                reportsDirectory: '../../coverage/apps/docs',
                provider: 'v8'
            },
            globals: true,
            environment: 'jsdom',
            setupFiles: ['src/test-setup.ts'],
            include: ['**/*.spec.ts'],
            cache: {
                dir: `../../node_modules/.vitest`
            }
        },
        define: {
            'import.meta.vitest': mode !== 'production'
        },
        server: {
            fs: {
                allow: ['../..']
            }
        }
    };
});
