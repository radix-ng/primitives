import { Directive, signal } from '@angular/core';
import { provideToken } from '@radix-ng/primitives/core';
import { AVATAR_ROOT_CONTEXT, AvatarContextToken } from './avatar-context.token';
import { RdxImageLoadingStatus } from './types';

@Directive({
    selector: 'span[rdxAvatarRoot]',
    exportAs: 'rdxAvatarRoot',
    providers: [provideToken(AVATAR_ROOT_CONTEXT, RdxAvatarRootDirective)]
})
export class RdxAvatarRootDirective implements AvatarContextToken {
    readonly imageLoadingStatus = signal<RdxImageLoadingStatus>('loading');
}
