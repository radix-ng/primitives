import {
    EnvironmentProviders,
    inject,
    InjectionToken,
    makeEnvironmentProviders,
    provideAppInitializer
} from '@angular/core';
import { RadixNG, type RadixNGConfig } from './config';

export const RADIX_NG_CONFIG = new InjectionToken<RadixNGConfig>('RADIX_NG_CONFIG');

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
        multi: false
    }));

    /**
     * Creates an AppInitializer to load and apply each RadixNG configuration
     * to the global RadixNG service before the app starts.
     */
    const initializer = provideAppInitializer(() => {
        const config = inject(RadixNG);
        features?.forEach((feature) => config.setConfig(feature));
        return;
    });

    return makeEnvironmentProviders([...providers, initializer]);
}
