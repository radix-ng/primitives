import { inject, InjectionToken } from '@angular/core';

import type { RadioGroupDirective } from './radio-group.directive';

export const RadioGroupToken = new InjectionToken<RadioGroupDirective>('RadioGroupToken');

export function injectRadioGroup(): RadioGroupDirective {
    return inject(RadioGroupToken);
}
