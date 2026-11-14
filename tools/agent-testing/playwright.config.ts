import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';
import { playgroundServer } from '../playwright/playground-server.mts';

const server = playgroundServer(resolve(__dirname, '../..'));

export default defineConfig({
    testDir: '.',
    testMatch: 'integration.spec.ts',
    outputDir: '../../dist/agent-testing/browser-results',
    reporter: [['list'], ['html', { outputFolder: '../../dist/agent-testing/browser-report', open: 'never' }]],
    fullyParallel: true,
    workers: 2,
    retries: 0,
    // runSession owns tracing for each fresh context and keeps it in that run's evidence.
    use: { baseURL: server.baseURL, trace: 'off' },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: server.webServer
});
