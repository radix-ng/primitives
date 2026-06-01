import { isPlatformBrowser } from '@angular/common';
import { Directive, inject, input, output, PLATFORM_ID, signal } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';
import { injectAvatarRootContext } from './avatar-context.token';
import { HTMLAttributeReferrerPolicy, RdxImageLoadingStatus } from './types';

/**
 * @group Components
 */
@Directive({
    selector: 'img[rdxAvatarImage]',
    exportAs: 'rdxAvatarImage',
    host: {
        role: 'img',
        '[attr.src]': 'src()',
        '[attr.referrerpolicy]': 'referrerPolicy()',
        '[style.display]': '(rootContext.imageLoadingStatus() === "loaded") ? null : "none"'
    }
})
export class RdxAvatarImageDirective {
    private readonly platformId = inject(PLATFORM_ID);

    protected readonly rootContext = injectAvatarRootContext();

    /**
     * @group Props
     */
    readonly src = input<string>();

    readonly referrerPolicy = input<HTMLAttributeReferrerPolicy>();

    /**
     * A callback providing information about the loading status of the image.
     * This is useful in case you want to control more precisely what to render as the image is loading.
     *
     * @group Emits
     */
    readonly onLoadingStatusChange = output<RdxImageLoadingStatus>();

    private readonly loadingStatus = signal<RdxImageLoadingStatus>('idle');

    constructor() {
        // Loading is browser-only; on the server the status stays 'idle'.
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        watch([this.src, this.referrerPolicy], ([src, referrer], onCleanup) => {
            if (!src) {
                this.loadingStatus.set('error');
                return;
            }

            const image = new window.Image();
            this.loadingStatus.set('loading');
            image.onload = () => this.loadingStatus.set('loaded');
            image.onerror = () => this.loadingStatus.set('error');
            // Set referrerPolicy before src so it applies to the fetch.
            if (referrer) {
                image.referrerPolicy = referrer;
            }
            image.src = src;

            // Drop handlers for a stale src (or on destroy) so a late load/error
            // can't overwrite the status for the current one.
            onCleanup(() => {
                image.onload = null;
                image.onerror = null;
            });
        });

        watch([this.loadingStatus], ([value]) => {
            this.onLoadingStatusChange.emit(value);
            if (value !== 'idle') {
                this.rootContext.imageLoadingStatus.set(value);
            }
        });
    }
}
