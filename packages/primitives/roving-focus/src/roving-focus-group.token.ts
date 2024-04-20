import { inject, InjectionToken } from '@angular/core';

import type { RovingFocusGroupDirective } from './roving-focus-group.directive';

export const RovingFocusGroupToken = new InjectionToken<RovingFocusGroupDirective>(
    'RovingFocusToken'
);

/**
 * Inject the roving focus directive instance.
 */
export function injectRovingFocusGroup(): RovingFocusGroupDirective {
    return inject(RovingFocusGroupToken);
}
