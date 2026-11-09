import { devices, type Project } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/** Desktop engines shared by differential fixtures and Storybook behavior checks. */
export function desktopBrowserProjects(workspaceRoot: string): Project[] {
    // Firefox's temporary -profile does not isolate its macOS app-data bookkeeping.
    // Keep it away from the installed browser's TCC-protected data (playwright#42768).
    const firefoxAppData = resolve(workspaceRoot, 'node_modules/.cache/radix-ng-parity/firefox-app-data');
    if (process.platform === 'darwin') mkdirSync(firefoxAppData, { recursive: true });
    return [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                launchOptions:
                    process.platform === 'darwin'
                        ? { env: { ...process.env, CFFIXED_USER_HOME: firefoxAppData } }
                        : undefined
            }
        },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } }
    ];
}
