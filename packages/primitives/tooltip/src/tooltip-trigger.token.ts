import { inject, InjectionToken } from '@angular/core';

import type { RdxTooltipTriggerDirective } from './tooltip-trigger.directive';

export const RdxTooltipTriggerToken = new InjectionToken<RdxTooltipTriggerDirective>(
    'RdxTooltipTriggerToken'
);

export function injectTooltipTrigger(): RdxTooltipTriggerDirective {
    return inject(RdxTooltipTriggerToken);
}
