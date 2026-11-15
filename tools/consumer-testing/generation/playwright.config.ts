import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const consumer = process.env['RADIX_GENERATION_DIR'];
if (!consumer) throw new Error('RADIX_GENERATION_DIR must identify the retained generated consumer.');
const port = Number(process.env['RADIX_GENERATION_PORT'] ?? 4501);
const probe = resolve(consumer, '../probe');
export default defineConfig({
    testDir: '.',
    testMatch: 'generation.spec.ts',
    outputDir: resolve(consumer, '../browser-results'),
    reporter: [['list'], ['json', { outputFile: resolve(consumer, '../browser-results.json') }]],
    workers: 1,
    retries: 0,
    use: { baseURL: `http://localhost:${port}`, trace: 'on', screenshot: 'only-on-failure' },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: [consumer, probe].map((directory, index) => ({
        command: `pnpm exec http-server "${directory}/dist/consumer/browser" -a 127.0.0.1 -p ${port + index} -s -c-1`,
        url: `http://localhost:${port + index}`,
        reuseExistingServer: false
    }))
});
