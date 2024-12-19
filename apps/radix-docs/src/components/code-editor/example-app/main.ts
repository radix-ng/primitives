export const main_ts = (
    componentName: string,
    selector: string
): string => `import { bootstrapApplication } from '@angular/platform-browser';
import { ${componentName} } from './app/${selector}';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApplicationConfig } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
  ],
};

bootstrapApplication(${componentName}, appConfig).catch((err) =>console.error(err));`;
