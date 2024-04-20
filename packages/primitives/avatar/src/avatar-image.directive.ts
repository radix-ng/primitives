import { Directive, ElementRef, HostListener, inject, OnInit } from '@angular/core';

import { RdxAvatarState } from './avatar.directive';
import { injectAvatar } from './avatar.token';

@Directive({
    selector: 'img[rdxAvatarImage]',
    standalone: true
})
export class RdxAvatarImageDirective implements OnInit {
    /**
     * Access the avatar
     */
    private readonly avatar = injectAvatar();

    /**
     * Access the image element ref.
     */
    private readonly elementRef = inject<ElementRef<HTMLImageElement>>(ElementRef);

    ngOnInit(): void {
        // mark the avatar as loading
        this.avatar.setState(RdxAvatarState.Loading);

        // if there is no src, we can report this as an error
        if (!this.elementRef.nativeElement.src) {
            this.avatar.setState(RdxAvatarState.Error);
        }

        // if the image has already loaded, we can report this to the avatar
        if (this.elementRef.nativeElement.complete) {
            this.avatar.setState(RdxAvatarState.Loaded);
        }
    }

    @HostListener('load')
    protected onLoad(): void {
        this.avatar.setState(RdxAvatarState.Loaded);
    }

    @HostListener('error')
    protected onError(): void {
        this.avatar.setState(RdxAvatarState.Error);
    }
}
