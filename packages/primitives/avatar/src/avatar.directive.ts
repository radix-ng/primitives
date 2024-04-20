import { Directive } from '@angular/core';

import { RdxAvatarToken } from './avatar.token';

@Directive({
    selector: '[rdxAvatar]',
    standalone: true,
    providers: [{ provide: RdxAvatarToken, useExisting: RdxAvatarDirective }]
})
export class RdxAvatarDirective {
    /**
     * Store the current state of the avatar.
     * @internal
     */
    state: RdxAvatarState = RdxAvatarState.Idle;

    /**
     * Set the avatar state.
     * @param state The state to set.
     * @internal
     */
    setState(state: RdxAvatarState): void {
        this.state = state;
    }
}

export enum RdxAvatarState {
    Idle,
    Loading,
    Loaded,
    Error
}
