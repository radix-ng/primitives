import { computed, Directive, ElementRef, inject, input, OnInit, output } from '@angular/core';
import { RdxAvatarRootContext, RdxImageLoadingStatus } from './avatar-root.directive';

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

    readonly src = input.required<string>();

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
