import { inject, InjectionToken } from '@angular/core';

import type { RdxToggleGroupMultiDirective } from './toggle-group-multi.directive';
import type { RdxToggleGroupDirective } from './toggle-group.directive';

export const RdxToggleGroupToken = new InjectionToken<
    RdxToggleGroupDirective | RdxToggleGroupMultiDirective
>('RdxToggleGroupToken');

export function injectToggleGroup(): RdxToggleGroupDirective | RdxToggleGroupMultiDirective {
    return inject(RdxToggleGroupToken);
}
