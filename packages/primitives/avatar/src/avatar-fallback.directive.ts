import { Directive, Input, numberAttribute, OnDestroy, OnInit } from '@angular/core';

import { injectAvatarConfig } from './avatar.config';
import { RdxAvatarState } from './avatar.directive';
import { injectAvatar } from './avatar.token';

@Directive({
    selector: '[rdxAvatarFallback]',
    standalone: true,
    host: {
        '[style.display]': 'visible ? null : "none"'
    }
})
export class RdxAvatarFallbackDirective implements OnInit, OnDestroy {
    /**
     * Access the avatar
     */
    private readonly avatar = injectAvatar();

    /**
     * Access the global configuration.
     */
    private readonly config = injectAvatarConfig();

    /**
     * Define a delay before the fallback is shown. This is useful to only show the fallback for those with slower connections.
     * @default 0
     */
    @Input({ alias: 'rdxAvatarFallbackDelay', transform: numberAttribute }) delay: number =
        this.config.delay;

    /**
     * Determine if this element should be hidden.
     */
    protected get visible(): boolean {
        // we need to check if the element can render and if the avatar is not in a loaded state
        return this.delayElapsed && this.avatar.state !== RdxAvatarState.Loaded;
    }

    /**
     * Determine the delay has elapsed, and we can show the fallback.
     */
    private delayElapsed = false;

    /**
     * Store the timeout id.
     */
    private timeoutId: number | null = null;

    ngOnInit(): void {
        this.timeoutId = window.setTimeout(() => (this.delayElapsed = true), this.delay);
    }

    ngOnDestroy(): void {
        if (this.timeoutId) {
            window.clearTimeout(this.timeoutId);
        }
    }
}
