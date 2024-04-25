import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { withViewTransitions } from '@angular/router';

import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { provideFileRouter } from '@analogjs/router';

export const appConfig: ApplicationConfig = {
    providers: [
        provideClientHydration(),
        provideContent(withMarkdownRenderer()),
        provideHttpClient(withFetch()),
        provideFileRouter(withViewTransitions())
    ]
};
