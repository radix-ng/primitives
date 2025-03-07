import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
    NoPreloading,
    PreloadAllModules,
    provideRouter,
    withInMemoryScrolling,
    withPreloading,
    withViewTransitions
} from '@angular/router';
import {
    NG_DOC_DEFAULT_PAGE_PROCESSORS,
    NG_DOC_DEFAULT_PAGE_SKELETON,
    NgDocDefaultSearchEngine,
    provideMainPageProcessor,
    provideNgDocApp,
    providePageSkeleton,
    provideSearchEngine
} from '@ng-doc/app';
import { NG_DOC_ROUTING, provideNgDocContext } from '@ng-doc/generated';
import {
    Check,
    ChevronDown,
    ChevronRight,
    Dot,
    LucideAngularModule,
    Minus,
    MoreHorizontal,
    Plus,
    Slash
} from 'lucide-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimations(),
        provideHttpClient(withFetch()),
        provideRouter(
            routes,
            withPreloading(isDevMode() ? NoPreloading : PreloadAllModules),
            withInMemoryScrolling({
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled'
            })
        ),

        importProvidersFrom(
            // todo: remove this as soon as lucide properly supports Angular standalone components.
            LucideAngularModule.pick({
                Plus,
                Minus,
                Slash,
                Check,
                MoreHorizontal,
                ChevronRight,
                ChevronDown,
                Dot
            })
        ),

        provideSearchEngine(NgDocDefaultSearchEngine),
        provideNgDocContext(),
        provideNgDocApp({
            shiki: {
                themes: [
                    import('shiki/themes/material-theme-darker.mjs'),
                    import('shiki/themes/material-theme-lighter.mjs')],
                theme: {
                    dark: 'material-theme-darker',
                    light: 'material-theme-lighter'
                }
            }
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
