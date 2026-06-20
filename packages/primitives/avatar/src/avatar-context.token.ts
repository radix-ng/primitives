import { WritableSignal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
import { RdxImageLoadingStatus } from './types';

export interface AvatarRootContext {
    imageLoadingStatus: WritableSignal<RdxImageLoadingStatus>;
}

export const [injectAvatarRootContext, provideAvatarRootContext] = createContext<AvatarRootContext>(
    'AvatarRootContext',
    'components/avatar'
);
