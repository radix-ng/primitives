import { inject, InjectionToken } from '@angular/core';
import type { RdxToggleGroupButtonDirective } from './toggle-group-button.directive';

export const RdxToggleGroupButtonToken = new InjectionToken<RdxToggleGroupButtonDirective>('RdxToggleGroupButtonToken');

export function injectToggleGroupButton(): RdxToggleGroupButtonDirective {
    return inject(RdxToggleGroupButtonToken);
}
