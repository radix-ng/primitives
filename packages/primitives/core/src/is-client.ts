import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export function injectIsClient() {
    return isPlatformBrowser(inject(PLATFORM_ID));
}
