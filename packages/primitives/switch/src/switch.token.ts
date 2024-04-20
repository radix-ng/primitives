import { inject, InjectionToken } from '@angular/core';

import type { SwitchDirective } from './switch.directive';

export const SwitchToken = new InjectionToken<SwitchDirective>('SwitchToken');

export function injectSwitch(): SwitchDirective {
    return inject(SwitchToken);
}
