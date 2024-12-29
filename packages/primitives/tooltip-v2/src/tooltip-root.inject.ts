import { assertInInjectionContext, inject, isDevMode } from '@angular/core';
import { RdxPopoverRootDirective } from './tooltip-root.directive';

export function injectPopoverRoot(optional?: false): RdxPopoverRootDirective;
export function injectPopoverRoot(optional: true): RdxPopoverRootDirective | null;
export function injectPopoverRoot(optional = false): RdxPopoverRootDirective | null {
    isDevMode() && assertInInjectionContext(injectPopoverRoot);
    return inject(RdxPopoverRootDirective, { optional });
}
