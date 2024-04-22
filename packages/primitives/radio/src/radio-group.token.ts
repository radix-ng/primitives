import { inject, InjectionToken } from '@angular/core';

import type { RdxRadioGroupDirective } from './radio-group.directive';

export const RdxRadioGroupToken = new InjectionToken<RdxRadioGroupDirective>('RdxRadioGroupToken');

export function injectRadioGroup(): RdxRadioGroupDirective {
    return inject(RdxRadioGroupToken);
}
