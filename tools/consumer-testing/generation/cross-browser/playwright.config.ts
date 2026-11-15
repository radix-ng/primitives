import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../../../playwright/browser-projects.mts';

const output = process.env['RADIX_MATRIX_DIR'];
if (!output) throw new Error('Run the cross-browser preparer to create independent builds and copied checks.');
const port = Number(process.env['RADIX_MATRIX_PORT'] ?? 4541);
const workspace = resolve(__dirname, '../../../..');
export default defineConfig({
    testDir: resolve(output, 'checks'),
    outputDir: resolve(output, 'browser-results'),
    reporter: [['list'], ['json', { outputFile: resolve(output, 'browser-results.json') }]],
    workers: 1,
    retries: 0,
    use: { trace: 'on', screenshot: 'only-on-failure' },
    projects: desktopBrowserProjects(output).flatMap((engine) =>
        ['select', 'email'].map((task, index) => ({
            ...engine,
            name: `${task}-${engine.name}`,
            testMatch: `${task}.spec.ts`,
            use: { ...engine.use, baseURL: `http://localhost:${port + index * 2}` }
        }))
    ),
    webServer: ['select-app', 'select-probe', 'email-app', 'email-probe'].map((name, index) => ({
        cwd: workspace,
        command: `"${process.execPath}" "${resolve(workspace, 'node_modules/http-server/bin/http-server')}" "${resolve(output, name, 'dist/consumer/browser')}" -a 127.0.0.1 -p ${port + index} -s -c-1`,
        url: `http://localhost:${port + index}`,
        reuseExistingServer: false
    }))
});
