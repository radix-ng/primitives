import {
    EnvironmentProviders,
    inject,
    InjectionToken,
    makeEnvironmentProviders,
    provideAppInitializer
} from '@angular/core';
import { RDX_DIRECTION } from '@radix-ng/primitives/direction-provider';
import { RadixNG, type RadixNGConfig } from './config';

export const RADIX_NG_CONFIG = new InjectionToken<readonly RadixNGConfig[]>('RADIX_NG_CONFIG', {
    providedIn: 'root',
    factory: () => []
});

/**
 * Provides RadixNG configuration as environment providers.
 *
 * @param features One or more RadixNG configuration objects.
 * @returns A set of environment providers that register the RadixNG configs.
 */
export function provideRadixNG(...features: RadixNGConfig[]): EnvironmentProviders {
    const providers = features?.map((feature) => ({
        provide: RADIX_NG_CONFIG,
        useValue: feature,
        multi: true
    }));

    /**
     * Creates an AppInitializer to load and apply each RadixNG configuration
     * to the global RadixNG service before the app starts.
     */
    const initializer = provideAppInitializer(() => {
        const config = inject(RadixNG);
        const configs = inject(RADIX_NG_CONFIG);

        configs.forEach((feature) => config.setConfig(feature));
        return;
    });

    return makeEnvironmentProviders([
        ...providers,
        { provide: RDX_DIRECTION, useFactory: () => inject(RadixNG).dir },
        initializer
    ]);
}
