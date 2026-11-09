import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../../tools/playwright/browser-projects.mts';
import base from './playwright.config';

// Reuse the actual stories and behavior checks; visual baselines retain their own config.
export default defineConfig(base, {
    testMatch: '**/select*.behavior.spec.ts',
    workers: 2,
    projects: desktopBrowserProjects(resolve(__dirname, '../..'))
});
