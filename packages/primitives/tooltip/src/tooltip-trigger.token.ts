import { InjectionToken, inject } from '@angular/core';
import type { TooltipTriggerDirective } from './tooltip-trigger.directive';

export const TooltipTriggerToken = new InjectionToken<TooltipTriggerDirective>(
    'TooltipTriggerToken'
);

export function injectTooltipTrigger(): TooltipTriggerDirective {
    return inject(TooltipTriggerToken);
}
