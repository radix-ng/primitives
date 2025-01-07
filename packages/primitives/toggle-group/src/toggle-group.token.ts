import { inject, InjectionToken } from '@angular/core';
import type { RdxToggleGroupDirective } from './toggle-group.directive';

export const RdxToggleGroupToken = new InjectionToken<RdxToggleGroupDirective>('RdxToggleGroupToken');

export function injectToggleGroup(): RdxToggleGroupDirective {
    return inject(RdxToggleGroupToken);
}
