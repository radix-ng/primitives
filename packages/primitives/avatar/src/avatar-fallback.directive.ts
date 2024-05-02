import {
    Directive,
    Inject,
    Input,
    NgZone,
    numberAttribute,
    OnDestroy,
    OnInit,
    Optional
} from '@angular/core';

import { RDX_AVATAR_TOKEN, RdxAvatarRootDirective } from './avatar-root.directive';
import {
    defaultAvatarConfig,
    PROVIDE_AVATAR_CONFIG,
    RDX_AVATAR_CONFIG_TOKEN,
    RdxAvatarConfig
} from './avatar.config';

export interface AvatarFallbackProps {
    delayMs?: number;
}

@Directive({
    selector: 'span[AvatarFallback]',
    exportAs: 'AvatarFallback',
    standalone: true,
    providers: [PROVIDE_AVATAR_CONFIG],
    host: {
        '[style.display]': 'visible ? null : "none"'
    }
})
export class RdxAvatarFallbackDirective implements AvatarFallbackProps, OnInit, OnDestroy {
    /**
     * Define a delay before the fallback is shown.
     * This is useful to only show the fallback for those with slower connections.
     * @default 0
     */
    @Input({ alias: 'rdxDelayMs', transform: numberAttribute }) delayMs: number =
        this.config.delayMs;

    protected get visible(): boolean {
        return this.delayElapsed && this.avatar._state() !== 'loaded';
    }

    /**
     * Determine the delay has elapsed, and we can show the fallback.
     */
    private delayElapsed = false;

    private timeoutId: number | null = null;

    constructor(
        private ngZone: NgZone,
        @Inject(RDX_AVATAR_TOKEN) private avatar: RdxAvatarRootDirective,
        @Optional() @Inject(RDX_AVATAR_CONFIG_TOKEN) private config: RdxAvatarConfig
    ) {
        this.config = config || defaultAvatarConfig;
    }

    ngOnInit(): void {
        this.ngZone.runOutsideAngular(() => {
            this.timeoutId = window.setTimeout(() => (this.delayElapsed = true), this.delayMs);
        });
    }

    ngOnDestroy(): void {
        this.ngZone.run(() => {
            if (this.timeoutId) {
                window.clearTimeout(this.timeoutId);
            }
        });
    }
}
