import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../../../playwright/browser-projects.mts';

const consumer = process.env['RADIX_GENERATION_DIR'];
if (!consumer) throw new Error('Pass the prepared Tabs consumer after its one coding session.');
const output = resolve(consumer, '..');
const workspace = resolve(__dirname, '../../../..');
const port = Number(process.env['RADIX_GENERATION_PORT'] ?? 4561);
export default defineConfig({
    testDir: '.',
    testMatch: 'generation.spec.ts',
    outputDir: resolve(output, 'browser-results'),
    reporter: [['list'], ['json', { outputFile: resolve(output, 'browser-results.json') }]],
    workers: 1,
    retries: 0,
    use: { baseURL: `http://localhost:${port}`, trace: 'on', screenshot: 'only-on-failure' },
    projects: desktopBrowserProjects(resolve(output, 'browser-state')),
    webServer: [consumer, resolve(output, 'probe')].map((directory, index) => ({
        cwd: workspace,
        command: `"${process.execPath}" "${resolve(workspace, 'node_modules/http-server/bin/http-server')}" "${resolve(directory, 'dist/consumer/browser')}" -a 127.0.0.1 -p ${port + index} -s -c-1`,
        url: `http://localhost:${port + index}`,
        reuseExistingServer: false
    }))
});
