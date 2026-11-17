import { InjectionToken, Provider, Signal } from '@angular/core';

/** State supplied by another primitive on the same Button host. */
export interface RdxButtonConfig {
    readonly disabled: Signal<boolean>;
    readonly focusableWhenDisabled: Signal<boolean>;
}

export const RDX_BUTTON_CONFIG = new InjectionToken<RdxButtonConfig>('RdxButtonConfig');

/** Shares an owning primitive's state with a Button applied to the same element. */
export function provideRdxButtonConfig(factory: () => RdxButtonConfig): Provider {
    return { provide: RDX_BUTTON_CONFIG, useFactory: factory };
}
