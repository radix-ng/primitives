import { inject, InjectionToken } from '@angular/core';
import type { RdxToggleGroupItemDirective } from './toggle-group-item.directive';

export const RdxToggleGroupItemToken = new InjectionToken<RdxToggleGroupItemDirective>('RdxToggleGroupItemToken');

export function injectToggleGroupItem(): RdxToggleGroupItemDirective {
    return inject(RdxToggleGroupItemToken);
}
