import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/postcss';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { prepareReference, workspaceRoot, writeReferencePaths } from './shared/reference.ts';
import { suiteFromEnvironment } from './shared/suites.ts';

const suite = suiteFromEnvironment();
const prepared = prepareReference();
writeReferencePaths(prepared);

export default defineConfig({
    root: suite.directory,
    cacheDir: resolve(workspaceRoot, `node_modules/.vite/parity-testing/${suite.name}`),
    plugins: [
        angular({ tsconfig: resolve(suite.directory, 'tsconfig.json') }),
        {
            name: 'parity-reference-manifest',
            generateBundle() {
                this.emitFile({
                    type: 'asset',
                    fileName: 'reference.json',
                    source: JSON.stringify(
                        { commit: prepared.commit, packageVersion: prepared.packageVersion, digest: prepared.digest },
                        null,
                        2
                    )
                });
            }
        }
    ],
    resolve: {
        tsconfigPaths: true,
        alias: [
            { find: /^@base-ui\/react\/(.*)/, replacement: `${prepared.directory}/packages/react/src/$1` },
            { find: /^@base-ui\/utils\/(.*)/, replacement: `${prepared.directory}/packages/utils/src/$1` }
        ],
        dedupe: [
            'react',
            'react-dom',
            '@babel/runtime',
            '@floating-ui/react-dom',
            '@floating-ui/utils',
            'use-sync-external-store',
            'reselect'
        ]
    },
    css: { postcss: { plugins: [tailwindcss()] } },
    define: {
        __PARITY_REFERENCE__: JSON.stringify({
            commit: prepared.commit,
            packageVersion: prepared.packageVersion,
            digest: prepared.digest
        })
    },
    build: {
        outDir: suite.fixturesDirectory,
        emptyOutDir: true,
        minify: false,
        sourcemap: true,
        rollupOptions: {
            input: { angular: resolve(suite.directory, 'angular.html'), react: resolve(suite.directory, 'react.html') }
        }
    },
    preview: { host: '127.0.0.1', port: suite.port, strictPort: true }
});
