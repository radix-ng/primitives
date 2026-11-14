import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../../tools/playwright/browser-projects.mts';

const port = Number(process.env['PLAYWRIGHT_PORT'] ?? 4496);
export default defineConfig({
    testDir: './tests',
    testMatch: 'agents-playground.behavior.spec.ts',
    outputDir: './test-results/playground',
    reporter: [['list'], ['html', { outputFolder: 'playwright-report/playground', open: 'never' }]],
    fullyParallel: true,
    workers: 2,
    retries: 0,
    use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure' },
    projects: desktopBrowserProjects(resolve(__dirname, '../..')),
    // Plain static files, with no SPA fallback or proxy. build-site creates every route index.
    webServer: {
        command: `pnpm exec http-server ../../dist/radix-site -a 127.0.0.1 -p ${port} -s -c-1`,
        url: `http://localhost:${port}/playground/agents/index.html`,
        reuseExistingServer: false
    }
});
