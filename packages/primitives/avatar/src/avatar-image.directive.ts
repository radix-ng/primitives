import { isPlatformBrowser } from '@angular/common';
import { Directive, inject, input, OnDestroy, OnInit, output, PLATFORM_ID, signal } from '@angular/core';
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
        '[attr.referrer-policy]': 'referrerPolicy()',
        '[style.display]': '(rootContext.imageLoadingStatus() === "loaded") ? null : "none"'
    }
})
export class RdxAvatarImageDirective implements OnInit, OnDestroy {
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

    private readonly isMounted = signal<boolean>(false);

    private readonly loadingStatus = signal<RdxImageLoadingStatus>('idle');

    constructor() {
        const updateStatus = (status: RdxImageLoadingStatus) => () => {
            if (this.isMounted()) {
                this.loadingStatus.set(status);
            }
        };

        if (isPlatformBrowser(this.platformId)) {
            watch([this.src, this.referrerPolicy], ([src, referrer]) => {
                if (this.isMounted()) {
                    if (!src) {
                        this.loadingStatus.set('error');
                    } else {
                        const image = new window.Image();
                        this.loadingStatus.set('loading');
                        image.onload = updateStatus('loaded');
                        image.onerror = updateStatus('error');
                        image.src = src;
                        if (referrer) {
                            image.referrerPolicy = referrer;
                        }
                    }
                }
            });

            watch([this.loadingStatus], ([value]) => {
                this.onLoadingStatusChange.emit(value);
                if (value !== 'idle') {
                    this.rootContext.imageLoadingStatus.set(value);
                }
            });
        } else {
            this.loadingStatus.set('idle');
        }
    }

    ngOnInit() {
        this.isMounted.set(true);
    }

    ngOnDestroy() {
        this.isMounted.set(false);
    }
}
