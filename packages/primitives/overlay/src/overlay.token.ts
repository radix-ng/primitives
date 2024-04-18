import { InjectionToken } from '@angular/core';
import type { OverlayDirective } from './overlay.directive';

export const OverlayToken = new InjectionToken<OverlayDirective>('OverlayToken');
