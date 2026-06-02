import { InjectionToken, Provider } from '@angular/core';
import { Align, Side } from './utils';

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
    sideOffset?: number;
    alignOffset?: number;
    arrowPadding?: number;
    avoidCollisions?: boolean;
    collisionPadding?: number | Partial<Record<Side, number>>;
    sticky?: 'partial' | 'always';
    hideWhenDetached?: boolean;
    positionStrategy?: 'fixed' | 'absolute';
    updatePositionStrategy?: 'optimized' | 'always';
}

export const RdxPopperContentConfigToken = new InjectionToken<RdxPopperContentConfig>('RdxPopperContentConfig', {
    factory: () => ({})
});

export function provideRdxPopperContentConfig(config: RdxPopperContentConfig): Provider {
    return { provide: RdxPopperContentConfigToken, useValue: config };
}
