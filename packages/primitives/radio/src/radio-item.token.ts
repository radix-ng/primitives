import { inject, InjectionToken } from '@angular/core';

import type { RdxRadioItemDirective } from './radio-item.directive';

export const RdxRadioItemToken = new InjectionToken<RdxRadioItemDirective>('RadioItemToken');

export function injectRadioItem(): RdxRadioItemDirective {
    return inject(RdxRadioItemToken);
}
