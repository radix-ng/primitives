import { Directive, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';

import { Placement } from '@floating-ui/dom';

import { OverlayArrowToken } from './overlay-arrow.token';
import { injectOverlayTrigger } from './overlay-trigger.token';

@Directive({
    selector: '[rdxOverlayArrow]',
    standalone: true,
    providers: [{ provide: OverlayArrowToken, useExisting: OverlayArrowDirective }]
})
export class OverlayArrowDirective implements OnInit, OnDestroy {
    /**
     * Access the arrow element
     */
    readonly elementRef = inject(ElementRef<HTMLElement>);

    /**
     * Access the overlay trigger
     */
    private readonly overlayTrigger = injectOverlayTrigger();

    /**
     * Register the arrow on init
     * @internal
     */
    ngOnInit(): void {
        this.overlayTrigger.registerArrow(this);
    }

    /**
     * Unregister the arrow on destroy
     * @internal
     */
    ngOnDestroy(): void {
        this.overlayTrigger.unregisterArrow();
    }

    /**
     * Define the position of the arrow.
     */
    setPosition(placement: Placement, arrowX?: number, arrowY?: number): void {
        const staticSide = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right'
        }[placement.split('-')[0]] as string;

        Object.assign(this.elementRef.nativeElement.style, {
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [staticSide]: `-${this.elementRef.nativeElement.offsetWidth / 2}px`
        });
    }
}
