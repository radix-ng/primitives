import { computed, Directive, ElementRef, inject, input, OnInit, output } from '@angular/core';
import { RdxAvatarRootContext, RdxImageLoadingStatus } from './avatar-root.directive';

/**
 * @group Components
 */
@Directive({
    selector: 'img[rdxAvatarImage]',
    standalone: true,
    exportAs: 'rdxAvatarImage',
    host: {
        '(load)': 'onLoad()',
        '(error)': 'onError()',
        '[style.display]': '(imageLoadingStatus() === "loaded")? null : "none"'
    }
})
export class RdxAvatarImageDirective implements OnInit {
    private readonly avatarRoot = inject(RdxAvatarRootContext);
    private readonly elementRef = inject(ElementRef<HTMLImageElement>);

    /**
     * @group Props
     */
    readonly src = input<string>();

    /**
     * A callback providing information about the loading status of the image.
     * This is useful in case you want to control more precisely what to render as the image is loading.
     *
     * @group Emits
     */
    readonly onLoadingStatusChange = output<RdxImageLoadingStatus>();

    protected readonly imageLoadingStatus = computed(() => this.avatarRoot.imageLoadingStatus());

    ngOnInit(): void {
        this.nativeElement.src = this.src();

        if (!this.nativeElement.src) {
            this.setImageStatus('error');
        } else if (this.nativeElement.complete) {
            this.setImageStatus('loaded');
        } else {
            this.setImageStatus('loading');
        }
    }

    onLoad() {
        this.setImageStatus('loaded');
    }

    onError() {
        this.setImageStatus('error');
    }

    private setImageStatus(status: RdxImageLoadingStatus) {
        this.avatarRoot.imageLoadingStatus.set(status);
        this.onLoadingStatusChange.emit(status);
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }
}
