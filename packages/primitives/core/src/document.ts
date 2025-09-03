import { DOCUMENT, inject } from '@angular/core';

export function injectDocument(): Document {
    return inject(DOCUMENT);
}
