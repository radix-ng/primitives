import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import base from './vite.config.mts';

export default defineConfig({
    ...base,
    build: {
        ...base.build,
        ssr: resolve('apps/radix-ssr-testing/hydration-audit/server.ts'),
        outDir: resolve('dist/portal-hydration-audit/server'),
        rollupOptions: { output: { entryFileNames: 'server.mjs' } }
    }
});
