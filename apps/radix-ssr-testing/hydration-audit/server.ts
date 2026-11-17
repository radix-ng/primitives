import '@angular/compiler';
import { APP_ID, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { readFile } from 'node:fs/promises';
import { PortalHydrationAudit, PROBE, SETTINGS } from './app';
import { settingsFor } from './settings';

export async function renderAudit(document: string, url: string) {
    // The Angular CLI normally adds this asset. A raw renderApplication/Vite fixture must supply
    // the same contract for event replay and hydrate-on-interaction to be representative.
    const eventContract = await readFile(
        new URL(import.meta.resolve('@angular/core/event-dispatch-contract.min.js')),
        'utf8'
    );
    document = document.replace('<body>', `<body><script id="ng-event-dispatch-contract">${eventContract}</script>`);
    return renderApplication(
        (context) =>
            bootstrapApplication(
                PortalHydrationAudit,
                {
                    providers: [
                        provideZonelessChangeDetection(),
                        provideClientHydration(),
                        provideServerRendering(),
                        { provide: APP_ID, useValue: 'portal-audit' },
                        { provide: SETTINGS, useValue: settingsFor(url) },
                        { provide: PROBE, useFactory: () => ({ ready: false, errors: [], constructed: [] }) }
                    ]
                },
                context
            ),
        { document, url, allowedHosts: ['127.0.0.1', 'localhost'] }
    );
}
