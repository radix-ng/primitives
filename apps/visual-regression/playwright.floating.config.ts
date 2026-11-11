import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../../tools/playwright/browser-projects.mts';
import { floatingTestMatch } from '../../tools/playwright/test-catalog.ts';
import base from './playwright.config';

// Shared Popper/focus/dismissal consumers, including families which compose Menu or Dialog.
// These are Angular regression checks; pinned-reference parity lives in apps/parity-testing.
export default defineConfig(base, {
    testMatch: floatingTestMatch,
    workers: 2,
    projects: desktopBrowserProjects(resolve(__dirname, '../..'))
});
