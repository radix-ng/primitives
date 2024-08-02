import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Check, LucideAngularModule, Package2 } from 'lucide-angular';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes),
        importProvidersFrom(
            // todo: remove this as soon as lucide properly supports Angular standalone components.
            LucideAngularModule.pick({ Package2, Check })
        )
    ]
};
