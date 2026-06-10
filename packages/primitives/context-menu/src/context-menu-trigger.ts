import { booleanAttribute, DestroyRef, Directive, inject, input, numberAttribute } from '@angular/core';
import { BooleanInput, NumberInput } from '@radix-ng/primitives/core';
import { injectRdxContextMenuRootContext } from './context-menu-root';

/**
 * An area that opens the context menu on right click (or a touch long-press).
 *
 * Apply it to the element that should respond to the context-menu gesture; the popup is positioned
 * at the pointer, not against this element.
 */
@Directive({
    selector: '[rdxContextMenuTrigger]',
    exportAs: 'rdxContextMenuTrigger',
    host: {
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '(contextmenu)': 'onContextMenu($event)',
        '(pointerdown)': 'onPointerDown($event)',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerup)': 'cancelLongPress()',
        '(pointercancel)': 'cancelLongPress()',
        '(pointerleave)': 'cancelLongPress()'
    }
})
export class RdxContextMenuTrigger {
    protected readonly rootContext = injectRdxContextMenuRootContext();

    /** Whether the trigger is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** How long (ms) a touch must be held before the menu opens. */
    readonly longPressDelay = input<number, NumberInput>(500, { transform: numberAttribute });

    private longPressTimer: ReturnType<typeof setTimeout> | undefined;
    private longPressOrigin: { x: number; y: number } | undefined;
    private lastPointerDownTime = 0;

    constructor() {
        inject(DestroyRef).onDestroy(() => this.cancelLongPress());
    }

    protected onContextMenu(event: MouseEvent): void {
        if (this.disabled()) {
            return;
        }

        // Suppress the native context menu and open ours at the pointer.
        event.preventDefault();
        this.cancelLongPress();

        // A keyboard-initiated context menu (e.g. the Menu key / Shift+F10) is not preceded by a
        // pointerdown, so it opens with the first item highlighted; a pointer opens the popup
        // without highlighting an item.
        const fromKeyboard = event.timeStamp - this.lastPointerDownTime > 300;
        this.rootContext.openAt(event.clientX, event.clientY, fromKeyboard ? 'first' : 'popup');
    }

    protected onPointerDown(event: PointerEvent): void {
        this.lastPointerDownTime = event.timeStamp;

        if (this.disabled() || event.pointerType !== 'touch') {
            return;
        }

        const { clientX, clientY } = event;
        this.longPressOrigin = { x: clientX, y: clientY };
        this.cancelLongPress();
        this.longPressTimer = setTimeout(() => {
            this.longPressTimer = undefined;
            this.rootContext.openAt(clientX, clientY);
        }, this.longPressDelay());
    }

    protected onPointerMove(event: PointerEvent): void {
        // A finger that drifts more than ~10px is a scroll/drag, not a long-press.
        if (!this.longPressOrigin) {
            return;
        }

        const dx = event.clientX - this.longPressOrigin.x;
        const dy = event.clientY - this.longPressOrigin.y;
        if (Math.hypot(dx, dy) > 10) {
            this.cancelLongPress();
        }
    }

    protected cancelLongPress(): void {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = undefined;
        this.longPressOrigin = undefined;
    }
}
