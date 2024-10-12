import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

export function injectDocument(): Document {
    return inject(DOCUMENT);
}
