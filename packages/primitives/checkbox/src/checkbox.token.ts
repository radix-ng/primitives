import { inject, InjectionToken } from '@angular/core';

import type { CheckboxDirective } from './checkbox.directive';

export const CheckboxToken = new InjectionToken<CheckboxDirective>('CheckboxToken');

export function injectCheckbox(): CheckboxDirective {
    return inject(CheckboxToken);
}
