import { AfterViewInit, Directive, ElementRef, inject, Input, NgZone, OnDestroy } from '@angular/core';
import { Thumb } from './slider.types';

@Directive({
    standalone: true
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RdxSliderThumbDirective implements AfterViewInit, OnDestroy {
    @Input() thumbPosition: Thumb | undefined;

    private sliderElement: HTMLInputElement | undefined;

    private readonly ngZone = inject(NgZone);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /** Thumb is currently pressed. */
    isActive = false;
    isHovered = false;

    ngAfterViewInit() {
        const input = this.sliderElement;

        if (input) {
            this.ngZone.runOutsideAngular(() => {
                input.addEventListener('pointermove', this.onPointerMove);
                input.addEventListener('pointerdown', this.onDragStart);
                input.addEventListener('pointerup', this.onDragEnd);
                input.addEventListener('pointerleave', this.onMouseLeave);
            });
        }
    }

    ngOnDestroy() {
        const input = this.sliderElement;

        if (input) {
            input.removeEventListener('pointermove', this.onPointerMove);
            input.removeEventListener('pointerdown', this.onDragStart);
            input.removeEventListener('pointerup', this.onDragEnd);
            input.removeEventListener('pointerleave', this.onMouseLeave);
        }
    }

    private onPointerMove = (_event: PointerEvent): void => {};

    private onDragStart = (event: PointerEvent): void => {
        if (event.button !== 0) {
            return;
        }
        this.isActive = true;
    };

    private onDragEnd = (_event: PointerEvent): void => {
        this.isActive = false;
    };

    private onMouseLeave = (_event: PointerEvent): void => {
        this.isHovered = false;
    };
}
