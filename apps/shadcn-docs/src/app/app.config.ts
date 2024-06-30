import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';

import {
    NG_DOC_DEFAULT_PAGE_PROCESSORS,
    NG_DOC_DEFAULT_PAGE_SKELETON,
    NG_DOC_NIGHT_THEME,
    NgDocDefaultSearchEngine,
    provideMainPageProcessor,
    provideNgDocApp,
    providePageSkeleton,
    provideSearchEngine
} from '@ng-doc/app';
import { NG_DOC_ROUTING, provideNgDocContext } from '@ng-doc/generated';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimations(),
        provideHttpClient(withFetch()),
        provideClientHydration(),

        provideNgDocContext(),
        provideNgDocApp(),
        provideSearchEngine(NgDocDefaultSearchEngine),
        providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON),
        provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS),
        provideRouter(
            [
                ...NG_DOC_ROUTING,
                {
                    path: '**',
                    redirectTo: 'getting-started/installation',
                    pathMatch: 'full'
                }
            ],
            withInMemoryScrolling({
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled'
            }),
            withViewTransitions()
        )
    ]
};
