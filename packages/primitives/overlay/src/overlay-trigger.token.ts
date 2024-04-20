import { inject, InjectionToken } from '@angular/core';

import type { OverlayTriggerDirective } from './overlay-trigger.directive';

export const OverlayTriggerToken = new InjectionToken<OverlayTriggerDirective>(
    'OverlayTriggerToken'
);

/**
 * Inject the overlay trigger directive
 */
export function injectOverlayTrigger(): OverlayTriggerDirective {
    return inject(OverlayTriggerToken);
}
