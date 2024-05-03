import { Directive, ElementRef, EventEmitter, inject, OnInit, Output } from '@angular/core';

import { ImageLoadingStatus, injectAvatar } from './avatar-root.directive';

export interface AvatarImageProps {
    onLoadingStatusChange?: EventEmitter<ImageLoadingStatus>;
}

@Directive({
    selector: 'img[AvatarImage]',
    exportAs: 'AvatarImage',
    standalone: true,
    host: {
        '(load)': '_onLoad()',
        '(error)': '_onError()'
    }
})
export class RdxAvatarImageDirective implements AvatarImageProps, OnInit {
    private readonly avatar = injectAvatar();

    private readonly elementRef = inject<ElementRef<HTMLImageElement>>(ElementRef);

    /* By default, it will only render when it has loaded.
     * You can use the `onLoadingStatusChange` handler if you need more control.
     */
    @Output() onLoadingStatusChange = new EventEmitter<ImageLoadingStatus>();

    ngOnInit(): void {
        this.avatar._setState('loading');

        if (!this.elementRef.nativeElement.src) {
            this.avatar._setState('error');
        }

        if (this.elementRef.nativeElement.complete) {
            this.avatar._setState('loaded');
        }

        this.onLoadingStatusChange.emit(this.avatar._state());
    }

    _onLoad(): void {
        this.avatar._setState('loaded');
        this.onLoadingStatusChange.emit('loaded');
    }

    _onError(): void {
        this.avatar._setState('error');
        this.onLoadingStatusChange.emit('error');
    }
}
