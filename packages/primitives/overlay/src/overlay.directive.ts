import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';
import { injectOverlayTrigger } from './overlay-trigger.token';
import { OverlayToken } from './overlay.token';

@Directive({
    selector: '[rdxOverlay]',
    standalone: true,
    providers: [{ provide: OverlayToken, useExisting: OverlayDirective }]
})
export class OverlayDirective implements OnInit, OnDestroy {
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
