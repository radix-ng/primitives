import { InjectionToken, Provider } from '@angular/core';

export interface RdxAvatarConfig {
    /**
     * Define a delay before the fallback is shown.
     * This is useful to only show the fallback for those with slower connections.
     * @default 0
     */
    delayMs: number;
}

export const defaultAvatarConfig: RdxAvatarConfig = {
    delayMs: 0
};

export const RDX_AVATAR_CONFIG_TOKEN = new InjectionToken<RdxAvatarConfig>(
    'RDX_AVATAR_CONFIG_TOKEN'
);

export const PROVIDE_AVATAR_CONFIG: Provider = {
    provide: RDX_AVATAR_CONFIG_TOKEN,
    useValue: defaultAvatarConfig
};
