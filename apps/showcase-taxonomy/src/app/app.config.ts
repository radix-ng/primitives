import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { withViewTransitions } from '@angular/router';

import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { provideFileRouter } from '@analogjs/router';
import { LucideAngularModule, X } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
    providers: [
        provideContent(withMarkdownRenderer()),
        provideHttpClient(withFetch()),
        provideFileRouter(withViewTransitions()),
        importProvidersFrom(LucideAngularModule.pick({ X }))
    ]
};
