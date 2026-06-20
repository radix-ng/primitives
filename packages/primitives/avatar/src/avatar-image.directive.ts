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
        // The host is a native `<img>` (selector `img[rdxAvatarImage]`) — its implicit `img` role is
        // already correct, and forcing `role="img"` here would override any consumer override (Base UI
        // adds no role).
        '[attr.src]': 'src()',
        '[attr.srcset]': 'srcSet()',
        '[attr.sizes]': 'sizes()',
        '[attr.crossorigin]': 'crossOrigin()',
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

    /**
     * A responsive `srcset` for the image. When set without `src`, an empty `src` no longer counts as
     * an error.
     *
     * @group Props
     */
    readonly srcSet = input<string>();

    /**
     * The `sizes` attribute paired with `srcSet`.
     *
     * @group Props
     */
    readonly sizes = input<string>();

    /**
     * The CORS mode used when fetching the image.
     *
     * @group Props
     */
    readonly crossOrigin = input<'anonymous' | 'use-credentials' | ''>();

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

        watch(
            [this.src, this.srcSet, this.sizes, this.crossOrigin, this.referrerPolicy],
            ([src, srcSet, sizes, crossOrigin, referrer], onCleanup) => {
                if (!src && !srcSet) {
                    this.loadingStatus.set('error');
                    return;
                }

                const image = new window.Image();
                this.loadingStatus.set('loading');
                image.onload = () => this.loadingStatus.set('loaded');
                image.onerror = () => this.loadingStatus.set('error');
                // Set the fetch-affecting attributes before `src`/`srcset` so they apply to the request.
                if (referrer) {
                    image.referrerPolicy = referrer;
                }
                if (crossOrigin !== undefined) {
                    image.crossOrigin = crossOrigin;
                }
                if (srcSet) {
                    image.srcset = srcSet;
                }
                if (sizes) {
                    image.sizes = sizes;
                }
                if (src) {
                    image.src = src;
                }

                // A cached/already-decoded image is ready synchronously — resolve immediately so the
                // fallback delay isn't started for an image that is already available.
                if (image.complete && image.naturalWidth > 0) {
                    this.loadingStatus.set('loaded');
                }

                // Drop handlers for a stale src (or on destroy) so a late load/error
                // can't overwrite the status for the current one.
                onCleanup(() => {
                    image.onload = null;
                    image.onerror = null;
                });
            }
        );

        watch([this.loadingStatus], ([value]) => {
            // Base UI fires the callback only once loading actually starts — skip the initial `idle`.
            if (value === 'idle') {
                return;
            }
            this.onLoadingStatusChange.emit(value);
            this.rootContext.imageLoadingStatus.set(value);
        });
    }
}
