import { inject, InjectionToken } from '@angular/core';
import type { RdxCheckboxDirective } from './checkbox.directive';

export const RdxCheckboxToken = new InjectionToken<RdxCheckboxDirective>('RdxCheckboxToken');

export function injectCheckbox(): RdxCheckboxDirective {
    return inject(RdxCheckboxToken);
}
