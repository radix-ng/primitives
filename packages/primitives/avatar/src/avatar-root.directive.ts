import { Directive, inject, signal } from '@angular/core';
import { AvatarRootContext, provideAvatarRootContext } from './avatar-context.token';
import { RdxImageLoadingStatus } from './types';

const rootContext = (): AvatarRootContext => {
    const root = inject(RdxAvatarRootDirective);
    return {
        imageLoadingStatus: root.imageLoadingStatus
    };
};

/**
 * @group Components
 */
@Directive({
    selector: 'span[rdxAvatarRoot]',
    exportAs: 'rdxAvatarRoot',
    providers: [provideAvatarRootContext(rootContext)]
})
export class RdxAvatarRootDirective {
    readonly imageLoadingStatus = signal<RdxImageLoadingStatus>('idle');
}
