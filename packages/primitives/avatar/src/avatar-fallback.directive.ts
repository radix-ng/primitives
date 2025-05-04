import { Directive, input, signal } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';
import { injectAvatarRootContext } from './avatar-context.token';
import { injectAvatarConfig } from './avatar.config';

/**
 * @group Components
 */
@Directive({
    selector: 'span[rdxAvatarFallback]',
    exportAs: 'rdxAvatarFallback',
    host: {
        '[style.display]': 'canRender() && rootContext.imageLoadingStatus() !== "loaded" ? null : "none" '
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

    private timeout: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        watch([this.rootContext.imageLoadingStatus], ([value]) => {
            if (value === 'loading') {
                this.canRender.set(false);
                if (this.delayMs()) {
                    this.timeout = setTimeout(() => {
                        this.canRender.set(true);
                        clearTimeout(this.timeout);
                    }, this.delayMs());
                } else {
                    this.canRender.set(true);
                }
            }
        });
    }
}
