import { InjectionToken, Provider } from '@angular/core';
import { Align, OffsetFunction, RdxCollisionAvoidance, Side } from './utils';

/**
 * Default positioning values for `RdxPopperContentWrapper`.
 *
 * Lets a composing primitive (e.g. tooltip) provide its own Base UI-aligned defaults without
 * changing the shared popper defaults that other consumers (e.g. popover) rely on. Any value left
 * `undefined` falls back to the wrapper's built-in default. Consumer template bindings always win.
 */
export interface RdxPopperContentConfig {
    side?: Side;
    align?: Align;
    sideOffset?: number | OffsetFunction;
    alignOffset?: number | OffsetFunction;
    arrowPadding?: number;
    /**
     * @deprecated Use {@link collisionAvoidance} instead. Kept for back-compat: `false` disables all
     * collision avoidance (equivalent to `{ side: 'none', align: 'none', fallbackAxisSide: 'none' }`).
     */
    avoidCollisions?: boolean;
    /** Per-primitive collision-avoidance default (Base UI parity). See {@link RdxCollisionAvoidance}. */
    collisionAvoidance?: RdxCollisionAvoidance;
    collisionPadding?: number | Partial<Record<Side, number>>;
    sticky?: 'partial' | 'always';
    hideWhenDetached?: boolean;
    positionStrategy?: 'fixed' | 'absolute';
    updatePositionStrategy?: 'optimized' | 'always';
}

/**
 * Collision-avoidance preset for dropdown-style popups (Base UI `DROPDOWN_COLLISION_AVOIDANCE`).
 *
 * Dropdowns (select / combobox / autocomplete / menu) strictly prefer their top/bottom placement and
 * cap their height with `var(--available-height)`, so they must **not** fall back to the perpendicular
 * (left/right) axis. `side`/`align` fall back to the wrapper default (`'flip'`).
 */
export const DROPDOWN_COLLISION_AVOIDANCE: RdxCollisionAvoidance = { fallbackAxisSide: 'none' };

/**
 * Collision-avoidance preset for regular popups (Base UI `POPUP_COLLISION_AVOIDANCE`).
 *
 * Popovers / tooltips / preview cards aren't height-capped and may freely flip to the perpendicular
 * axis, preferring the logical end side. This equals the wrapper's built-in default; it is exported so
 * popups can state the intent explicitly.
 */
export const POPUP_COLLISION_AVOIDANCE: RdxCollisionAvoidance = { fallbackAxisSide: 'end' };

export const RdxPopperContentConfigToken = new InjectionToken<RdxPopperContentConfig>('RdxPopperContentConfig', {
    factory: () => ({})
});

export function provideRdxPopperContentConfig(config: RdxPopperContentConfig): Provider {
    return { provide: RdxPopperContentConfigToken, useValue: config };
}
