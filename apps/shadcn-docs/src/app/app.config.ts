import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';

import {
    NG_DOC_DEFAULT_PAGE_PROCESSORS,
    NG_DOC_DEFAULT_PAGE_SKELETON,
    provideMainPageProcessor,
    provideNgDocApp,
    providePageSkeleton
} from '@ng-doc/app';
import { NG_DOC_ROUTING, provideNgDocContext } from '@ng-doc/generated';
import { Check, LucideAngularModule } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimations(),
        provideHttpClient(withFetch()),

        importProvidersFrom(
            // todo: remove this as soon as lucide properly supports Angular standalone components.
            LucideAngularModule.pick({ Check })
        ),

        provideNgDocContext(),
        provideNgDocApp({
            themes: [
                {
                    path: 'ngdoc-light.css',
                    id: 'light'
                },
                {
                    path: 'ngdoc-dark.css',
                    id: 'dark'
                }
            ],
            defaultThemeId: 'light'
        }),
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
