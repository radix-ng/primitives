import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../../tools/playwright/browser-projects.mts';
import { playgroundServer } from '../../tools/playwright/playground-server.mts';

const server = playgroundServer(resolve(__dirname, '../..'));
export default defineConfig({
    testDir: './tests',
    testMatch: 'agents-playground.behavior.spec.ts',
    outputDir: './test-results/playground',
    reporter: [['list'], ['html', { outputFolder: 'playwright-report/playground', open: 'never' }]],
    fullyParallel: true,
    workers: 2,
    retries: 0,
    use: { baseURL: server.baseURL, trace: 'retain-on-failure' },
    projects: desktopBrowserProjects(resolve(__dirname, '../..')),
    // Plain static files, with no SPA fallback or proxy. build-site creates every route index.
    webServer: server.webServer
});
