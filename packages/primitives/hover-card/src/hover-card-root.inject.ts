import { assertInInjectionContext, inject, isDevMode } from '@angular/core';
import { RdxHoverCardRootDirective } from './hover-card-root.directive';

export function injectHoverCardRoot(optional?: false): RdxHoverCardRootDirective;
export function injectHoverCardRoot(optional: true): RdxHoverCardRootDirective | null;
export function injectHoverCardRoot(optional = false): RdxHoverCardRootDirective | null {
    isDevMode() && assertInInjectionContext(injectHoverCardRoot);
    return inject(RdxHoverCardRootDirective, { optional });
}
