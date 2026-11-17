import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import base from '../../../vite.config.mts';
export default defineConfig({
    ...base,
    build: {
        ...base.build,
        ssr: resolve('apps/parity-testing/primitives/tabs/hydration/server.ts'),
        outDir: resolve('dist/parity-testing/tabs/hydration-server'),
        rollupOptions: { output: { entryFileNames: 'server.mjs' } }
    }
});
