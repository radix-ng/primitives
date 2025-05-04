import { inject, InjectionToken } from '@angular/core';
import type { RdxCheckboxRootDirective } from './checkbox.directive';

export const RdxCheckboxToken = new InjectionToken<RdxCheckboxRootDirective>('RdxCheckboxToken');

export function injectCheckbox(): RdxCheckboxRootDirective {
    return inject(RdxCheckboxToken);
}
