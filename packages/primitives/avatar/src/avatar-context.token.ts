import { RdxImageLoadingStatus } from './types';
import { WritableSignal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

export interface AvatarRootContext {
    imageLoadingStatus: WritableSignal<RdxImageLoadingStatus>;
}

export const [injectAvatarRootContext, provideAvatarRootContext] = createContext<AvatarRootContext>(
    'AvatarRootContext',
    'components/avatar'
);
