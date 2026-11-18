import '@angular/compiler';
import { CSP_NONCE, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import '../../../../radix-storybook/.storybook/main.css';
import { AngularHydrationTabs, HYDRATION_CHANGES, HYDRATION_SETTINGS } from './angular-app';
import { hydrationNonce, hydrationSettings } from './cases';
window.tabsHydration = { ready: false, changes: [], errors: [], reference: __PARITY_REFERENCE__ };
void bootstrapApplication(AngularHydrationTabs, {
    providers: [
        provideZonelessChangeDetection(),
        provideClientHydration(),
        { provide: CSP_NONCE, useValue: hydrationNonce },
        { provide: HYDRATION_SETTINGS, useValue: hydrationSettings(location.href) },
        { provide: HYDRATION_CHANGES, useValue: window.tabsHydration.changes }
    ]
}).then(async (app) => {
    await app.whenStable();
    window.tabsHydration.ready = true;
});
