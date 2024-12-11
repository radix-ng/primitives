import { assertInInjectionContext, inject } from '@angular/core';
import { RdxPopoverRootDirective } from './popover-root.directive';
import { RdxPopoverRootToken } from './popover-root.token';

export function injectPopoverRoot(): RdxPopoverRootDirective {
    assertInInjectionContext(injectPopoverRoot);
    return inject(RdxPopoverRootToken);
}
