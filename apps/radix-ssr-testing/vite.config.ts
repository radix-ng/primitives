import angular from '@analogjs/vite-plugin-angular';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
    root,
    cacheDir: '../../node_modules/.vitest/apps/radix-ssr-testing',
    resolve: { tsconfigPaths: true },
    plugins: [angular()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test-setup.ts'],
        include: ['**/*.spec.ts', '**/*.test.ts'],
        passWithNoTests: true,
        coverage: {
            enabled: mode === 'ci',
            provider: 'v8',
            reportsDirectory: '../../coverage/apps/radix-ssr-testing'
        }
    },
    define: {
        'import.meta.vitest': mode !== 'production'
    }
}));
