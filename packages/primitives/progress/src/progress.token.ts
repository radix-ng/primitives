import { InjectionToken, inject } from '@angular/core';
import type { ProgressDirective } from './progress.directive';

export const ProgressToken = new InjectionToken<ProgressDirective>('ProgressDirective');

export function injectProgress(): ProgressDirective {
    return inject(ProgressToken);
}
