import { InjectionToken, inject } from '@angular/core';
import type { RadioItemDirective } from './radio-item.directive';

export const RadioItemToken = new InjectionToken<RadioItemDirective>('RadioItemToken');

export function injectRadioItem(): RadioItemDirective {
    return inject(RadioItemToken);
}
