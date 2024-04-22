import { inject, InjectionToken } from '@angular/core';

import type { RdxOverlayTriggerDirective } from './overlay-trigger.directive';

export const RdxOverlayTriggerToken = new InjectionToken<RdxOverlayTriggerDirective>(
    'RdxOverlayTriggerToken'
);

/**
 * Inject the overlay trigger directive
 */
export function injectOverlayTrigger(): RdxOverlayTriggerDirective {
    return inject(RdxOverlayTriggerToken);
}
