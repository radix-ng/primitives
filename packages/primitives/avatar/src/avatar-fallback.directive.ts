import { isPlatformBrowser } from '@angular/common';
import { Directive, inject, Input, NgZone, numberAttribute, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
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

    private readonly platformId = inject(PLATFORM_ID);

    /**
     * Define a delay before the fallback is shown.
     * This is useful to only show the fallback for those with slower connections.
     * @default 0
     */
    @Input({ alias: 'rdxDelayMs', transform: numberAttribute }) delayMs: number = this.config.delayMs;

    protected get visible(): boolean {
        return this.delayElapsed && this.avatar._state() !== 'loaded';
    }

    /**
     * Determine the delay has elapsed, and we can show the fallback.
     */
    private delayElapsed = false;

    private timeoutId: number | null = null;

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.ngZone.runOutsideAngular(() => {
                this.timeoutId = globalThis.setTimeout(() => {
                    this.ngZone.run(() => {
                        this.delayElapsed = true;
                    });
                }, this.delayMs);
            });
        }
    }

    ngOnDestroy(): void {
        if (isPlatformBrowser(this.platformId) && this.timeoutId !== null) {
            globalThis.clearTimeout(this.timeoutId);
        }
    }
}
