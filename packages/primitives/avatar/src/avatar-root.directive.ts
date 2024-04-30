import { Directive, inject, InjectionToken, signal } from '@angular/core';

const RdxAvatarToken = new InjectionToken<RdxAvatarRootDirective>('RdxAvatarToken');

export function injectAvatar(): RdxAvatarRootDirective {
    return inject(RdxAvatarToken);
}

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

@Directive({
    selector: 'span[AvatarRoot]',
    exportAs: 'AvatarRoot',
    standalone: true,
    providers: [{ provide: RdxAvatarToken, useExisting: RdxAvatarRootDirective }]
})
export class RdxAvatarRootDirective {
    /**
     * A readonly signal property that holds the current state of image loading.
     * To set a new status, use the `setState` method of the component.
     * @internal
     */
    readonly _state = signal<ImageLoadingStatus>('idle');

    /**
     * Set the avatar state.
     * @param state The new image loading status to set. This value should be one of the predefined states
     *              in the `ImageLoadingStatus`
     * @returns void This method does not return a value.
     * @internal
     */
    _setState(state: ImageLoadingStatus): void {
        this._state.set(state);
    }
}
