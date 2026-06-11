import { afterNextRender, booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from '@radix-ng/primitives/field';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { injectSelectRootContext } from './select-root';
import { OPEN_KEYS } from './utils';

const attr = (value: boolean) => (value ? '' : undefined);

@Directive({
    selector: 'button[rdxSelectTrigger]',
    hostDirectives: [RdxPopperAnchor],
    host: {
        role: 'combobox',
        type: 'button',
        '[attr.id]': 'id()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.aria-invalid]': 'invalidState() ? "true" : undefined',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.disabled]': 'isDisabled() ? "" : undefined',
        '[dir]': 'rootContext.dir()',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-popup-open]': 'dataAttr(rootContext.open())',
        '[attr.data-placeholder]': 'dataAttr(rootContext.isEmptyModelValue())',
        '[attr.data-disabled]': 'dataAttr(isDisabled())',
        '[attr.data-invalid]': 'dataAttr(invalidState())',
        '[attr.data-valid]': 'dataAttr(!invalidState())',
        '[attr.data-required]': 'dataAttr(requiredState())',
        '[attr.data-filled]': 'dataAttr(filledState())',
        '[attr.data-focused]': 'dataAttr(focusedState())',
        '(click)': 'onClickHandler($event)',
        '(pointerdown)': 'onPointerDown($event)',
        '(pointerup)': 'onPointerUp($event)',
        '(keydown)': 'onKeydown($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    }
})
export class RdxSelectTrigger {
    readonly rootContext = injectSelectRootContext();

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly fieldRootContext = injectFieldRootContext(true);

    /** The trigger id; Field labels and descriptions reference it for accessible relationships. */
    readonly id = input(injectId('rdx-select-trigger-'));

    readonly disabled = input(false, { transform: booleanAttribute });

    readonly isDisabled = computed(
        () => this.rootContext.disabled() || this.disabled() || Boolean(this.fieldRootContext?.disabledState())
    );

    protected readonly invalidState = computed(() => Boolean(this.fieldRootContext?.invalidState()));
    protected readonly requiredState = computed(() => Boolean(this.fieldRootContext?.requiredState()));
    protected readonly filledState = computed(
        () => !this.rootContext.isEmptyModelValue() || Boolean(this.fieldRootContext?.filledState())
    );
    protected readonly focusedState = computed(() => Boolean(this.fieldRootContext?.focusedState()));

    protected readonly describedBy = computed(() => {
        if (!this.fieldRootContext) {
            return undefined;
        }
        const ids = [
            ...this.fieldRootContext.descriptionIds(),
            ...(this.fieldRootContext.invalidState() ? this.fieldRootContext.errorIds() : [])
        ];
        return ids.length ? ids.join(' ') : undefined;
    });

    constructor() {
        afterNextRender(() => {
            this.rootContext.onTriggerChange(this.elementRef);
            this.fieldRootContext?.setControlId(this.id());
            this.fieldRootContext?.setFilled(!this.rootContext.isEmptyModelValue());
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

    onFocus(): void {
        this.fieldRootContext?.setFocused(true);
    }

    onBlur(): void {
        this.fieldRootContext?.setFocused(false);
        this.fieldRootContext?.setTouched(true);
    }

    protected readonly dataAttr = attr;
}
