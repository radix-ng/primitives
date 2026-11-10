import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../../tools/playwright/browser-projects.mts';
import base from './playwright.config';

export default defineConfig(base, {
    testMatch: '**/docs-navigation.behavior.spec.ts',
    outputDir: './test-results/docs',
    reporter: [['html', { outputFolder: 'playwright-report/docs', open: 'never' }], ['list']],
    workers: 2,
    projects: desktopBrowserProjects(resolve(__dirname, '../..'))
});
