import {
    Directive,
    inject,
    Input,
    NgZone,
    numberAttribute,
    OnDestroy,
    OnInit
} from '@angular/core';

import { injectAvatar } from './avatar-root.directive';
import { injectAvatarConfig } from './avatar.config';

export interface RdxAvatarFallbackProps {
    delayMs?: number;
}

@Directive({
    selector: 'span[rdxAvatarFallback]',
    exportAs: 'rdxAvatarFallback',
    standalone: true,
    host: {
        '[style.display]': 'visible ? null : "none"'
    }
})
export class RdxAvatarFallbackDirective implements RdxAvatarFallbackProps, OnInit, OnDestroy {
    private readonly avatar = injectAvatar();

    private readonly config = injectAvatarConfig();

    private readonly ngZone = inject(NgZone);

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
