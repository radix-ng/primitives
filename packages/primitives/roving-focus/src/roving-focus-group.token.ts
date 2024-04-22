import { inject, InjectionToken } from '@angular/core';

import type { RdxRovingFocusGroupDirective } from './roving-focus-group.directive';

export const RdxRovingFocusGroupToken = new InjectionToken<RdxRovingFocusGroupDirective>(
    'RdxRovingFocusToken'
);

/**
 * Inject the roving focus directive instance.
 */
export function injectRovingFocusGroup(): RdxRovingFocusGroupDirective {
    return inject(RdxRovingFocusGroupToken);
}
