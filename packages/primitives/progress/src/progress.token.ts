import { inject, InjectionToken } from '@angular/core';

import type { RdxProgressDirective } from './progress.directive';

export const RdxProgressToken = new InjectionToken<RdxProgressDirective>('RdxProgressDirective');

export function injectProgress(): RdxProgressDirective {
    return inject(RdxProgressToken);
}
