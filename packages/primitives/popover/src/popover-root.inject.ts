import { assertInInjectionContext, inject, isDevMode } from '@angular/core';
import { RdxPopoverRootDirective } from './popover-root.directive';
import { RdxPopoverRootToken } from './popover-root.token';

export function injectPopoverRoot(): RdxPopoverRootDirective {
    isDevMode() && assertInInjectionContext(injectPopoverRoot);
    return inject(RdxPopoverRootToken);
}
