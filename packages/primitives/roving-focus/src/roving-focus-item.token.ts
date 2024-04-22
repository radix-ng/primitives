import { inject, InjectionToken } from '@angular/core';

import type { RdxRovingFocusItemDirective } from './roving-focus-item.directive';

export const RdxRovingFocusItemToken = new InjectionToken<RdxRovingFocusItemDirective>(
    'RdxRovingFocusItemToken'
);

export function injectRovingFocusItem(): RdxRovingFocusItemDirective {
    return inject(RdxRovingFocusItemToken);
}
