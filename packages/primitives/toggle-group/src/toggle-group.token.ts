import { inject, InjectionToken } from '@angular/core';
import type { RdxToggleGroupMultipleDirective } from './toggle-group-multiple.directive';
import type { RdxToggleGroupDirective } from './toggle-group.directive';

export const RdxToggleGroupToken = new InjectionToken<RdxToggleGroupDirective | RdxToggleGroupMultipleDirective>(
    'RdxToggleGroupToken'
);

export function injectToggleGroup(): RdxToggleGroupDirective | RdxToggleGroupMultipleDirective {
    return inject(RdxToggleGroupToken);
}
