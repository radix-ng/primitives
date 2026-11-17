import '@angular/compiler';
import { CSP_NONCE, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import type {} from '@base-ui/react/global';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { AngularHydrationTabs, HYDRATION_CHANGES, HYDRATION_SETTINGS } from './angular-app';
import { hydrationNonce, hydrationSettings } from './cases';
import { ReactHydrationTabs } from './react-app';
export async function renderHydration(framework: string, url: string, document: string) {
    const settings = hydrationSettings(url);
    if (framework === 'react')
        return document.replace(
            '<!--hydration-root-->',
            renderToString(createElement(ReactHydrationTabs, { settings, changes: [] }))
        );
    return renderApplication(
        (context) =>
            bootstrapApplication(
                AngularHydrationTabs,
                {
                    providers: [
                        provideZonelessChangeDetection(),
                        provideClientHydration(),
                        provideServerRendering(),
                        { provide: CSP_NONCE, useValue: hydrationNonce },
                        { provide: HYDRATION_SETTINGS, useValue: settings },
                        { provide: HYDRATION_CHANGES, useFactory: () => [] }
                    ]
                },
                context
            ),
        { document, url, allowedHosts: ['127.0.0.1'] }
    );
}
