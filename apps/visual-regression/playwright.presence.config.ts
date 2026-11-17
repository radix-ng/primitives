import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../../tools/playwright/browser-projects.mts';
import base from './playwright.config';

/** Shared render lifetime: native CSS discovery, popup actions and complete Tabs views. */
export default defineConfig(base, {
    testMatch: ['**/presence-waapi.behavior.spec.ts', '**/select-actions.behavior.spec.ts', '**/tabs.behavior.spec.ts'],
    workers: 2,
    projects: desktopBrowserProjects(resolve(__dirname, '../..'))
});
