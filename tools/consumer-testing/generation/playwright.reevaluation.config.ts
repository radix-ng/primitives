import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const output = process.env['RADIX_GENERATION_REEVALUATION_DIR'];
if (!output) throw new Error('Pass a separate reevaluation directory containing both production builds.');
const port = Number(process.env['RADIX_GENERATION_PORT'] ?? 4501);
export default defineConfig({
    testDir: '.',
    testMatch: 'generation-v2.spec.ts',
    outputDir: resolve(output, 'browser-results'),
    reporter: [['list'], ['json', { outputFile: resolve(output, 'browser-results.json') }]],
    workers: 1,
    retries: 0,
    use: { baseURL: `http://localhost:${port}`, trace: 'on', screenshot: 'only-on-failure' },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: ['application', 'probe'].map((name, index) => ({
        cwd: resolve(__dirname, '../../..'),
        command: `pnpm exec http-server "${resolve(output, name, 'dist/consumer/browser')}" -a 127.0.0.1 -p ${port + index} -s -c-1`,
        url: `http://localhost:${port + index}`,
        reuseExistingServer: false
    }))
});
