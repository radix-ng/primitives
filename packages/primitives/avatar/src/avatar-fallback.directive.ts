import { Directive, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { RdxAvatarRootContext } from './avatar-root.directive';
import { injectAvatarConfig } from './avatar.config';

@Directive({
    selector: 'span[rdxAvatarFallback]',
    standalone: true,
    exportAs: 'rdxAvatarFallback',
    host: {
        '[style.display]': 'shouldRender ? null : "none" '
    }
})
export class RdxAvatarFallbackDirective implements OnDestroy {
    protected readonly avatarRoot = inject(RdxAvatarRootContext);

    private readonly config = injectAvatarConfig();

    readonly delayMs = input<number>(this.config.delayMs);

    protected readonly canRender = signal(false);
    private timeoutId: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        effect(
            () => {
                const status = this.avatarRoot.imageLoadingStatus();
                if (status === 'loading') {
                    this.startDelayTimer();
                } else {
                    this.clearDelayTimer();
                    this.canRender.set(false);
                }
            },
            { allowSignalWrites: true }
        );
    }

    get shouldRender() {
        return this.canRender() && this.avatarRoot.imageLoadingStatus() !== 'loaded';
    }

    private startDelayTimer() {
        this.clearDelayTimer();
        if (this.delayMs() > 0) {
            this.timeoutId = setTimeout(() => {
                this.canRender.set(true);
            }, this.delayMs());
        } else {
            this.canRender.set(true);
        }
    }

    private clearDelayTimer() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    ngOnDestroy() {
        this.clearDelayTimer();
    }
}
