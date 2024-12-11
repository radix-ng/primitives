import { assertInInjectionContext, inject } from '@angular/core';
import { RdxPopoverArrowDirective } from './popover-arrow.directive';
import { RdxPopoverArrowToken } from './popover-arrow.token';

export function injectPopoverArrow(): RdxPopoverArrowDirective {
    assertInInjectionContext(injectPopoverArrow);
    return inject(RdxPopoverArrowToken);
}
