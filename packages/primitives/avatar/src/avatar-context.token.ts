import { inject, InjectionToken, WritableSignal } from '@angular/core';
import { RdxImageLoadingStatus } from './types';

export interface AvatarContextToken {
    imageLoadingStatus: WritableSignal<RdxImageLoadingStatus>;
}

export const AVATAR_ROOT_CONTEXT = new InjectionToken<AvatarContextToken>('AVATAR_ROOT_CONTEXT');

export function injectAvatarRootContext(): AvatarContextToken {
    return inject(AVATAR_ROOT_CONTEXT);
}
