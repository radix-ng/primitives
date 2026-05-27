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

    onKeyDown(event: Event) {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key === 'Home') {
            this.homeKeyDown.emit(keyEvent);
            // Prevent scrolling to page start
            event.preventDefault();
        } else if (keyEvent.key === 'End') {
            this.endKeyDown.emit(keyEvent);
            // Prevent scrolling to page end
            event.preventDefault();
        } else if (PAGE_KEYS.concat(ARROW_KEYS).includes(keyEvent.key)) {
            this.stepKeyDown.emit(keyEvent);
            // Prevent scrolling for directional key presses
            event.preventDefault();
        }
    }

    onPointerDown(event: Event) {
        const pointerEvent = event as PointerEvent;
        const target = event.target as HTMLElement;
        target.setPointerCapture(pointerEvent.pointerId);

        // Prevent browser focus behaviour because we focus a thumb manually when values change.
        event.preventDefault();

        // Touch devices have a delay before focusing so won't focus if touch immediately moves
        // away from target (sliding). We want thumb to focus regardless.
        if (this.rootContext.thumbElements.includes(target)) {
            target.focus();
        } else {
            this.slideStart.emit(pointerEvent);
        }
    }

    onPointerMove(event: Event) {
        const pointerEvent = event as PointerEvent;
        const target = event.target as HTMLElement;
        if (target.hasPointerCapture(pointerEvent.pointerId)) {
            this.slideMove.emit(pointerEvent);
        }
    }

    onPointerUp(event: Event) {
        const pointerEvent = event as PointerEvent;
        const target = event.target as HTMLElement;
        if (target.hasPointerCapture(pointerEvent.pointerId)) {
            target.releasePointerCapture(pointerEvent.pointerId);
            this.slideEnd.emit(pointerEvent);
        }
    }
}
