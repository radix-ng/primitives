import { Directive, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';

import { injectOverlayTrigger } from './overlay-trigger.token';
import { RdxOverlayToken } from './overlay.token';

@Directive({
    selector: '[rdxOverlay]',
    standalone: true,
    providers: [{ provide: RdxOverlayToken, useExisting: RdxOverlayDirective }]
})
export class RdxOverlayDirective implements OnInit, OnDestroy {
    /**
     * Access the overlay element
     */
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    /**
     * Access the overlay trigger
     */
    private readonly overlayTrigger = injectOverlayTrigger();

    /**
     * Register the overlay on init
     */
    ngOnInit(): void {
        this.overlayTrigger.registerOverlay(this);
    }

    /**
     * Unregister the overlay on destroy
     */
    ngOnDestroy(): void {
        this.overlayTrigger.unregisterOverlay();
    }

    /**
     * Set the position of the overlay
     * @param x The x position
     * @param y The y position
     * @internal
     */
    setPosition(x?: number, y?: number): void {
        Object.assign(this.elementRef.nativeElement.style, {
            left: `${x}px`,
            top: `${y}px`
        });
    }
}
