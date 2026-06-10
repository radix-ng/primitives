import { afterNextRender, booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { injectSelectRootContext } from './select-root';
import { OPEN_KEYS } from './utils';

@Directive({
    selector: 'button[rdxSelectTrigger]',
    hostDirectives: [RdxPopperAnchor],
    host: {
        role: 'combobox',
        type: 'button',
        '[attr.disabled]': 'isDisabled() ? "" : undefined',
        '[dir]': 'rootContext.dir()',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '(click)': 'onClickHandler($event)',
        '(pointerdown)': 'onPointerDown($event)',
        '(pointerup)': 'onPointerUp($event)',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxSelectTrigger {
    readonly rootContext = injectSelectRootContext();

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly disabled = input(false, { transform: booleanAttribute });

    readonly isDisabled = computed(() => this.rootContext.disabled() || this.disabled());

    constructor() {
        afterNextRender(() => {
            this.rootContext.onTriggerChange(this.elementRef);
        });
    }

    handleOpen() {
        if (!this.isDisabled()) {
            this.rootContext.onOpenChange(true);
        }
    }

    handlePointerOpen(event: Event) {
        const pointerEvent = event as PointerEvent;
        this.handleOpen();
        this.rootContext.triggerPointerDownPosRef.set({
            x: Math.round(pointerEvent.pageX),
            y: Math.round(pointerEvent.pageY)
        });
    }

    onClickHandler(event: Event) {
        // Whilst browsers generally have no issue focusing the trigger when clicking
        // on a label, Safari seems to struggle with the fact that there's no `onClick`.
        // We force `focus` in this case. Note: this doesn't create any other side-effect
        // because we are preventing default in `onPointerDown` so effectively
        // this only runs for a label 'click'
        (event?.currentTarget as HTMLElement)?.focus();
    }

    onPointerDown(event: Event) {
        const pointerEvent = event as PointerEvent;
        if (pointerEvent.pointerType === 'touch') return event.preventDefault();

        // prevent implicit pointer capture
        // https://www.w3.org/TR/pointerevents3/#implicit-pointer-capture
        const target = event.target as HTMLElement;
        if (target.hasPointerCapture(pointerEvent.pointerId)) {
            target.releasePointerCapture(pointerEvent.pointerId);
        }

        // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
        // but not when the control key is pressed (avoiding MacOS right click)
        if (pointerEvent.button === 0 && pointerEvent.ctrlKey === false) {
            this.handlePointerOpen(event);
            // prevent trigger from stealing focus from the active item after opening.
            event.preventDefault();
        }
    }

    onPointerUp(event: Event) {
        const pointerEvent = event as PointerEvent;
        event.preventDefault();
        // Only open on pointer up when using touch devices
        if (pointerEvent.pointerType === 'touch') this.handlePointerOpen(event);
    }

    onKeydown(event: Event) {
        const keyEvent = event as KeyboardEvent;
        if (OPEN_KEYS.includes(keyEvent.key)) {
            this.handleOpen();
            event.preventDefault();
        }
    }
}
