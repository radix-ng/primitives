/// <reference types="vitest" />
import analog from '@analogjs/platform';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as fs from 'fs';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

const getPostRoutes = () => {
    const posts = fs.readdirSync(`apps/showcase-taxonomy/src/content`);
    return posts.map((post) => `/blog/${post.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '')}`);
};

const postRoutes = {
    en: getPostRoutes()
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        root: __dirname,
        publicDir: 'src/public',
        build: {
            outDir: '../../dist/apps/showcase-taxonomy/client',
            emptyOutDir: true,
            reportCompressedSize: true,
            commonjsOptions: {
                transformMixedEsModules: true
            },
            target: ['es2020']
        },
        resolve: {
            mainFields: ['module']
        },
        plugins: [
            analog({
                ssr: false,
                static: true,
                vite: { experimental: { supportAnalogFormat: true } },
                prerender: {
                    routes: async () => {
                        return ['/', '/login', '/pricing', '/blog', ...postRoutes.en];
                    }
                },
                nitro: {
                    logLevel: 3,
                    preset: 'vercel',
                    serveStatic: false,
                    prerender: {
                        failOnError: true
                    },
                    externals: { inline: ['zone.js/node', 'tslib'] }
                }
            }),
            nxViteTsPaths(),
            splitVendorChunkPlugin()

        ],
        test: {
            reporters: ['default'],
            coverage: {
                reportsDirectory: '../coverage/showcase-taxonomy',
                provider: 'v8'
            },
            globals: true,
            environment: 'jsdom',
            setupFiles: ['src/test-setup.ts'],
            include: ['**/*.spec.ts'],
            cache: {
                dir: `../node_modules/.vitest`
            }
        },
        define: {
            'import.meta.vitest': mode !== 'production'
        },
        server: {
            fs: {
                allow: ['.']
            }
        }
    };
});
