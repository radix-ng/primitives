import { Platform } from '@angular/cdk/platform';
import { inject } from '@angular/core';

export function injectIsClient() {
    return inject(Platform).isBrowser;
}
