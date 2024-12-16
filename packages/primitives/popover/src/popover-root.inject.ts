import { assertInInjectionContext, inject, isDevMode } from '@angular/core';
import { RdxPopoverRootDirective } from './popover-root.directive';
import { RdxPopoverRootToken } from './popover-root.token';

export function injectPopoverRoot(optional?: false): RdxPopoverRootDirective;
export function injectPopoverRoot(optional: true): RdxPopoverRootDirective | null;
export function injectPopoverRoot(optional = false): RdxPopoverRootDirective | null {
    isDevMode() && assertInInjectionContext(injectPopoverRoot);
    return inject(RdxPopoverRootToken, { optional });
}
