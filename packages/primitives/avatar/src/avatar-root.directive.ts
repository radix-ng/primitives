import { Directive, Injectable, signal } from '@angular/core';

export type RdxImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

@Injectable()
export class RdxAvatarRootContext {
    readonly imageLoadingStatus = signal<RdxImageLoadingStatus>('loading');
}

@Directive({
    selector: 'span[rdxAvatarRoot]',
    exportAs: 'rdxAvatarRoot',
    standalone: true,
    providers: [RdxAvatarRootContext]
})
export class RdxAvatarRootDirective {}
