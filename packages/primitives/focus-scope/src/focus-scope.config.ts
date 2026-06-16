import { InjectionToken, Provider, Signal, signal } from '@angular/core';

export type RdxFocusScopeConfig = {
    trapped: Signal<boolean>;

    /**
     * Optional return-focus policy override (ADR 0017 `returnFocus`), resolved by an enclosing
     * {@link RdxFloatingFocusManager} at **unmount time**. The focus scope owns the *timing* (its queued
     * post-unmount focus); this lets the manager own the *target*:
     * - `false` → do **not** return focus;
     * - an `HTMLElement` → return focus there **explicitly** (bypasses the moved-focus guard, matching
     *   Base UI's `hasExplicitReturnFocus`);
     * - `undefined` → default behavior (return to the element focused before mount, with the guard).
     */
    returnFocus?: () => HTMLElement | false | undefined;
};

export const RdxFocusScopeConfigToken = new InjectionToken<RdxFocusScopeConfig>('RdxFocusScopeConfig', {
    factory: () => ({
        trapped: signal(false)
    })
});

export function provideRdxFocusScopeConfig(factory: () => RdxFocusScopeConfig): Provider {
    return { provide: RdxFocusScopeConfigToken, useFactory: factory };
}
