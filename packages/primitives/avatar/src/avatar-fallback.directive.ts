import { injectAvatarConfig } from './avatar.config';
import { injectAvatarRootContext } from './avatar-context.token';
import { Directive, input, signal } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';

/**
 * @group Components
 */
@Directive({
    selector: 'span[rdxAvatarFallback]',
    exportAs: 'rdxAvatarFallback',
    host: {
        '[style.display]': 'canRender() && rootContext.imageLoadingStatus() !== "loaded" ? null : "none"'
    }
})
export class RdxAvatarFallbackDirective {
    private readonly config = injectAvatarConfig();

    protected readonly rootContext = injectAvatarRootContext();

    /**
     * Useful for delaying rendering so it only appears for those with slower connections.
     *
     * @group Props
     * @defaultValue 0
     */
    readonly delayMs = input<number>(this.config.delayMs);

    protected readonly canRender = signal(false);

    constructor() {
        // Enable the fallback after an optional delay (so it only appears for
        // those on slower connections), independent of the image load status —
        // matches Radix/Base UI. The `display` binding then hides it once the
        // image has loaded.
        watch([this.delayMs], ([delayMs], onCleanup) => {
            this.canRender.set(false);

            if (delayMs) {
                const timeout = setTimeout(() => this.canRender.set(true), delayMs);
                // Cancel a pending delay if delayMs changes or the directive is
                // destroyed before it fires.
                onCleanup(() => clearTimeout(timeout));
            } else {
                this.canRender.set(true);
            }
        });
    }
}
