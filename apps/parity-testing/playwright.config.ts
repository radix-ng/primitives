import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../../tools/playwright/browser-projects.mts';
import { appRoot, workspaceRoot } from './shared/reference.ts';
import { suiteFromEnvironment } from './shared/suites.ts';

const suite = suiteFromEnvironment();
const baseURL = `http://127.0.0.1:${suite.port}`;

export default defineConfig({
    testDir: resolve(suite.directory, 'tests'),
    outputDir: resolve(suite.resultsDirectory, 'test-results'),
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 2,
    use: { baseURL, trace: 'retain-on-failure' },
    reporter: [
        ['list'],
        [resolve(appRoot, 'shared/reporter.ts'), { title: suite.title, outputDirectory: suite.resultsDirectory }],
        ['html', { outputFolder: resolve(suite.resultsDirectory, 'html'), open: 'never' }]
    ],
    projects: desktopBrowserProjects(workspaceRoot),
    webServer: {
        command: 'pnpm exec vite preview --config apps/parity-testing/vite.config.mts',
        cwd: workspaceRoot,
        url: `${baseURL}/angular.html`,
        reuseExistingServer: false
    }
});
