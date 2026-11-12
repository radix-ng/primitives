import { InjectionToken, Provider, Signal, signal } from '@angular/core';

export type RdxFocusScopeConfig = {
    trapped: Signal<boolean>;

    /** A composing manager can deactivate a retained view's scope without destroying the view. */
    enabled?: Signal<boolean>;
    /** A composing modal focus manager requests looping in addition to the local `loop` input. */
    loop?: Signal<boolean>;
    /** Stop keyboard/programmatic trapping at logical close while retaining unmount/return-focus ownership. */
    trapActive?: () => boolean;
    /** Default fallback target, guarded unless the return policy explicitly requests it. */
    defaultReturnFocus?: () => HTMLElement | null | undefined;
    /** Owner reference used when the preferred pre-open target was body or was removed. */
    fallbackReturnFocus?: () => HTMLElement | null | undefined;

    /**
     * Optional return-focus policy override (ADR 0017 `returnFocus`), resolved by an enclosing
     * {@link RdxFloatingFocusManager} at **deactivation/unmount time**. The focus scope owns the *timing* (its queued
     * post-unmount focus); this lets the manager own the *target*:
     * - `false` → do **not** return focus;
     * - `true` → explicitly return to the default target, including after focus moved;
     * - an `HTMLElement` → return focus there **explicitly** (bypasses the moved-focus guard, matching
     *   Base UI's `hasExplicitReturnFocus`);
     * - `undefined` → guarded default return (the composing manager's fallback, or previous focus).
     */
    returnFocus?: () => HTMLElement | boolean | undefined;
};

export const RdxFocusScopeConfigToken = new InjectionToken<RdxFocusScopeConfig>('RdxFocusScopeConfig', {
    factory: () => ({
        trapped: signal(false)
    })
});

export function provideRdxFocusScopeConfig(factory: () => RdxFocusScopeConfig): Provider {
    return { provide: RdxFocusScopeConfigToken, useFactory: factory };
}
