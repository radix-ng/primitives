import { InjectionToken, Provider, Signal, signal } from '@angular/core';

export type RdxFocusScopeConfig = {
    trapped: Signal<boolean>;
};

export const RdxFocusScopeConfigToken = new InjectionToken<RdxFocusScopeConfig>('RdxFocusScopeConfig', {
    factory: () => ({
        trapped: signal(false)
    })
});

export function provideRdxFocusScopeConfig(factory: () => RdxFocusScopeConfig): Provider {
    return { provide: RdxFocusScopeConfigToken, useFactory: factory };
}
