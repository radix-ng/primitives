import { Directive, ElementRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { injectAvatar, RdxImageLoadingStatus } from './avatar-root.directive';

export interface RdxAvatarImageProps {
    onLoadingStatusChange?: EventEmitter<RdxImageLoadingStatus>;
}

@Directive({
    selector: 'img[rdxAvatarImage]',
    exportAs: 'rdxAvatarImage',
    standalone: true,
    host: {
        '(load)': 'onLoad()',
        '(error)': 'onError()'
    }
})
export class RdxAvatarImageDirective implements RdxAvatarImageProps, OnInit {
    private readonly avatar = injectAvatar();

    private readonly elementRef = inject<ElementRef<HTMLImageElement>>(ElementRef);

    /**
     * By default, it will only render when it has loaded.
     * You can use the `onLoadingStatusChange` handler if you need more control.
     */
    @Output() onLoadingStatusChange = new EventEmitter<RdxImageLoadingStatus>();

    ngOnInit(): void {
        this.avatar._setState('loading');

        if (!this.nativeElement.src) {
            this.avatar._setState('error');
        }

        if (this.nativeElement.complete) {
            this.avatar._setState('loaded');
        }

        this.onLoadingStatusChange.emit(this.avatar._state());
    }

    protected onLoad(): void {
        this.avatar._setState('loaded');
        this.onLoadingStatusChange.emit('loaded');
    }

    protected onError(): void {
        this.avatar._setState('error');
        this.onLoadingStatusChange.emit('error');
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }
}
