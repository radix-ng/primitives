import angular from '@analogjs/vite-plugin-angular';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
    root,
    cacheDir: '../../node_modules/.vitest/packages/primitives',
    resolve: { tsconfigPaths: true },
    plugins: [angular()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test-setup.ts'],
        include: ['**/*.spec.ts', '**/*.test.ts'],
        coverage: {
            enabled: mode === 'ci',
            provider: 'v8',
            reportsDirectory: '../../coverage/packages/primitives'
        }
    },
    define: {
        'import.meta.vitest': mode !== 'production'
    }
}));
