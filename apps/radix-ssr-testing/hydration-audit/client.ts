import '@angular/compiler';
import { APP_ID, ErrorHandler, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { AuditErrors, PortalHydrationAudit, PROBE, SETTINGS } from './app';
import { settingsFor, type AuditProbe } from './settings';

const probe: AuditProbe = { ready: false, errors: [], constructed: [] };
window.portalHydrationAudit = probe;
void bootstrapApplication(PortalHydrationAudit, {
    providers: [
        provideZonelessChangeDetection(),
        provideClientHydration(),
        { provide: APP_ID, useValue: 'portal-audit' },
        { provide: SETTINGS, useValue: settingsFor(location.href) },
        { provide: PROBE, useValue: probe },
        { provide: ErrorHandler, useClass: AuditErrors }
    ]
})
    .then(async (app) => {
        app.isStable.subscribe((stable) => (probe.stable = stable));
        probe.whenStable = () => app.whenStable();
        await app.whenStable();
        probe.ready = true;
    })
    .catch((error: unknown) => {
        probe.errors.push(error instanceof Error ? error.message : String(error));
    });
