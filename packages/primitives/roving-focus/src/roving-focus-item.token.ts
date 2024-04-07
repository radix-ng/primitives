import { InjectionToken, inject } from '@angular/core';
import type { RovingFocusItemDirective } from './roving-focus-item.directive';

export const RovingFocusItemToken = new InjectionToken<RovingFocusItemDirective>(
    'RovingFocusItemToken'
);

export function injectRovingFocusItem(): RovingFocusItemDirective {
    return inject(RovingFocusItemToken);
}
