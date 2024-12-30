import { assertInInjectionContext, inject, isDevMode } from '@angular/core';
import { RdxTooltipRootDirective } from './hover-card-root.directive';

export function injectTooltipRoot(optional?: false): RdxTooltipRootDirective;
export function injectTooltipRoot(optional: true): RdxTooltipRootDirective | null;
export function injectTooltipRoot(optional = false): RdxTooltipRootDirective | null {
    isDevMode() && assertInInjectionContext(injectTooltipRoot);
    return inject(RdxTooltipRootDirective, { optional });
}
