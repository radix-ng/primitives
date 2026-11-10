import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { desktopBrowserProjects } from '../../tools/playwright/browser-projects.mts';
import base from './playwright.config';

// Shared Popper/focus/dismissal consumers, including families which compose Menu or Dialog.
// These are Angular regression checks; pinned-reference parity lives in apps/parity-testing.
export default defineConfig(base, {
    testMatch: [
        '**/select*.behavior.spec.ts',
        ...[
            'floating-consumers',
            'popper',
            'popover',
            'tooltip',
            'preview-card',
            'menu',
            'menu-submenu',
            'context-menu',
            'menubar',
            'navigation-menu',
            'combobox',
            'autocomplete',
            'toast',
            'dialog',
            'alert-dialog'
        ].map((name) => `**/${name}.behavior.spec.ts`)
    ],
    workers: 2,
    projects: desktopBrowserProjects(resolve(__dirname, '../..'))
});
