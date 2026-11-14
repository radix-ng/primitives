import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../playwright/browser-projects.mts';

const consumer = process.env['RADIX_CONSUMER_DIR'];
if (!consumer) throw new Error('Run node tools/consumer-testing/run.mjs to prepare an isolated consumer.');
const port = Number(process.env['RADIX_CONSUMER_PORT'] ?? 4497);

export default defineConfig({
    testDir: '.',
    testMatch: 'consumer.spec.ts',
    outputDir: resolve(consumer, '../browser-results'),
    reporter: [['list'], ['json', { outputFile: resolve(consumer, '../browser-results.json') }]],
    fullyParallel: true,
    workers: 2,
    retries: 0,
    use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure' },
    projects: desktopBrowserProjects(resolve(__dirname, '../..')),
    webServer: {
        command: `pnpm exec http-server "$RADIX_CONSUMER_DIR/dist/consumer/browser" -a 127.0.0.1 -p ${port} -s -c-1`,
        url: `http://localhost:${port}`,
        reuseExistingServer: false
    }
});
