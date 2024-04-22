import { inject, InjectionToken } from '@angular/core';

import type { RdxSwitchDirective } from './switch.directive';

export const RdxSwitchToken = new InjectionToken<RdxSwitchDirective>('RdxSwitchToken');

export function injectSwitch(): RdxSwitchDirective {
    return inject(RdxSwitchToken);
}
