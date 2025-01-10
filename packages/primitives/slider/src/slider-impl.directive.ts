import { Directive, inject, output } from '@angular/core';
import { RdxSliderRootComponent } from './slider-root.component';
import { ARROW_KEYS, PAGE_KEYS } from './utils';

@Directive({
    selector: '[rdxSliderImpl]',
    host: {
        role: 'slider',
        tabindex: '0',
        '(keydown)': 'onKeyDown($event)',
        '(pointerdown)': 'onPointerDown($event)',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerup)': 'onPointerUp($event)'
    }
})
export class RdxSliderImplDirective {
    protected readonly rootContext = inject(RdxSliderRootComponent);

    readonly slideStart = output<PointerEvent>();
    readonly slideMove = output<PointerEvent>();
    readonly slideEnd = output<PointerEvent>();
    readonly homeKeyDown = output<KeyboardEvent>();
    readonly endKeyDown = output<KeyboardEvent>();
    readonly stepKeyDown = output<KeyboardEvent>();

    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Home') {
            this.homeKeyDown.emit(event);
            // Prevent scrolling to page start
            event.preventDefault();
        } else if (event.key === 'End') {
            this.endKeyDown.emit(event);
            // Prevent scrolling to page end
            event.preventDefault();
        } else if (PAGE_KEYS.concat(ARROW_KEYS).includes(event.key)) {
            this.stepKeyDown.emit(event);
            // Prevent scrolling for directional key presses
            event.preventDefault();
        }
    }

    onPointerDown(event: PointerEvent) {
        const target = event.target as HTMLElement;
        target.setPointerCapture(event.pointerId);

        // Prevent browser focus behaviour because we focus a thumb manually when values change.
        event.preventDefault();

        // Touch devices have a delay before focusing so won't focus if touch immediately moves
        // away from target (sliding). We want thumb to focus regardless.
        if (this.rootContext.thumbElements.includes(target)) {
            target.focus();
        } else {
            this.slideStart.emit(event);
        }
    }

    onPointerMove(event: PointerEvent) {
        const target = event.target as HTMLElement;
        if (target.hasPointerCapture(event.pointerId)) {
            this.slideMove.emit(event);
        }
    }

    onPointerUp(event: PointerEvent) {
        const target = event.target as HTMLElement;
        if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
            this.slideEnd.emit(event);
        }
    }
}
