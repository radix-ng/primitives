import { inject, InjectionToken, Provider } from '@angular/core';

export interface RdxAvatarConfig {
    /**
     * Define a delay before the fallback is shown. This is useful to only show the fallback for those with slower connections.
     * @default 0
     */
    delay: number;
}

export const defaultAvatarConfig: RdxAvatarConfig = {
    delay: 0
};

export const RdxAvatarConfigToken = new InjectionToken<RdxAvatarConfig>('RdxAvatarConfigToken');

export function provideRdxAvatarConfig(config: Partial<RdxAvatarConfig>): Provider[] {
    return [
        {
            provide: RdxAvatarConfigToken,
            useValue: { ...defaultAvatarConfig, ...config }
        }
    ];
}

export function injectAvatarConfig(): RdxAvatarConfig {
    return inject(RdxAvatarConfigToken, { optional: true }) ?? defaultAvatarConfig;
}
