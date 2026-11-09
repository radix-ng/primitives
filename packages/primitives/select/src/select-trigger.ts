import { booleanAttribute, computed, DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { injectFieldRootContext } from '@radix-ng/primitives/field';
import { createRdxTriggerInteraction } from '@radix-ng/primitives/floating-focus-manager';
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
        '[attr.aria-labelledby]': 'labelledBy()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.aria-controls]': 'triggerInteraction.ariaControls()',
        '[attr.aria-expanded]': 'triggerInteraction.ariaExpanded()',
        '[attr.aria-invalid]': 'displayValid() === false ? "true" : undefined',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.aria-readonly]': 'readOnlyState() ? "true" : undefined',
        '[attr.disabled]': 'isDisabled() ? "" : undefined',
        '[dir]': 'rootContext.dir()',
        '[attr.data-popup-open]': 'triggerInteraction.dataPopupOpen()',
        '[attr.data-placeholder]': 'dataAttr(rootContext.isEmptyModelValue())',
        '[attr.data-disabled]': 'dataAttr(isDisabled())',
        '[attr.data-invalid]': 'dataAttr(displayValid() === false)',
        '[attr.data-valid]': 'dataAttr(displayValid() === true)',
        '[attr.data-required]': 'dataAttr(requiredState())',
        '[attr.data-readonly]': 'dataAttr(readOnlyState())',
        '[attr.data-touched]': 'dataAttr(touchedState())',
        '[attr.data-dirty]': 'dataAttr(dirtyState())',
        '[attr.data-filled]': 'dataAttr(filledState())',
        '[attr.data-focused]': 'dataAttr(focusedState())',
        '(click)': 'onClickHandler($event)',
        '(pointerdown)': 'onPointerDown($event)',
        '(pointerup)': 'onPointerUp($event)',
        '(keydown)': 'onKeydown($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur($event)'
    }
})
export class RdxSelectTrigger {
    readonly rootContext = injectSelectRootContext();

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly fieldRootContext = injectFieldRootContext(true);

    /** The trigger id; Field labels and descriptions reference it for accessible relationships. */
    readonly idInput = input<string>(undefined, { alias: 'id' });
    readonly id = computed(() => this.idInput() ?? this.rootContext.id());

    /** Explicit accessible-name references override the associated Field / Select label. */
    readonly ariaLabelledBy = input<string>(undefined, { alias: 'aria-labelledby' });
    protected readonly labelledBy = computed(
        () => this.ariaLabelledBy() ?? this.fieldRootContext?.labelId() ?? this.rootContext.labelId()
    );

    readonly disabled = input(false, { transform: booleanAttribute });

    readonly isDisabled = computed(
        () => this.rootContext.disabled() || this.disabled() || Boolean(this.fieldRootContext?.disabledState())
    );
    protected readonly triggerInteraction = createRdxTriggerInteraction({
        trigger: () => this.elementRef.nativeElement,
        activeTrigger: () => this.rootContext.triggerElement(),
        open: () => this.rootContext.open(),
        disabled: () => this.isDisabled(),
        contentId: () => this.rootContext.contentId
    });

    /**
     * Tri-state *displayed* validity: when inside a `rdxFieldRoot` the field's gated `validState` is the
     * single source (so the field's `validationMode` keeps the trigger neutral until revealed), otherwise
     * the trigger's own binary invalidity.
     */
    protected readonly displayValid = computed<boolean | null>(() =>
        this.fieldRootContext ? this.fieldRootContext.validState() : this.rootContext.validState()
    );
    protected readonly requiredState = computed(
        () => this.rootContext.required() || Boolean(this.fieldRootContext?.requiredState())
    );
    protected readonly readOnlyState = computed(() => this.rootContext.readOnly());
    protected readonly touchedState = computed(
        () => this.rootContext.touchedState() || Boolean(this.fieldRootContext?.touchedState())
    );
    protected readonly dirtyState = computed(
        () => this.rootContext.dirtyState() || Boolean(this.fieldRootContext?.dirtyState())
    );
    protected readonly filledState = computed(
        () => !this.rootContext.isEmptyModelValue() || Boolean(this.fieldRootContext?.filledState())
    );
    protected readonly focusedState = computed(() => Boolean(this.fieldRootContext?.focusedState()));

    protected readonly describedBy = computed(() => {
        if (!this.fieldRootContext) {
            return undefined;
        }
        const ids = [...this.fieldRootContext.descriptionIds(), ...this.fieldRootContext.errorIds()];
        return ids.length ? ids.join(' ') : undefined;
    });

    constructor() {
        this.rootContext.onTriggerChange(this.elementRef);
        effect(() => {
            this.rootContext.triggerId.set(this.id());
            this.fieldRootContext?.setControlId(this.id());
            this.fieldRootContext?.setFilled(!this.rootContext.isEmptyModelValue());
        });
        effect(() => {
            if (this.isDisabled()) this.rootContext.resetTypeahead();
        });
        inject(DestroyRef).onDestroy(() => {
            if (this.rootContext.triggerElement() === this.elementRef.nativeElement) {
                this.rootContext.triggerElement.set(null);
                this.rootContext.triggerId.set(undefined);
            }
        });
    }

    handleOpen(reason: 'trigger-press' | 'list-navigation', event: Event): boolean {
        if (!this.isDisabled()) {
            return this.rootContext.onOpenChange(true, reason, event);
        }

        return false;
    }

    handlePointerOpen(event: Event) {
        const pointerEvent = event as PointerEvent;

        if (this.handleOpen('trigger-press', event)) {
            this.rootContext.triggerPointerDownPosRef.set({
                x: Math.round(pointerEvent.pageX),
                y: Math.round(pointerEvent.pageY)
            });
        }
    }

    onClickHandler(event: Event) {
        // Whilst browsers generally have no issue focusing the trigger when clicking
        // on a label, Safari seems to struggle with the fact that there's no `onClick`.
        // We force `focus` in this case. Note: this doesn't create any other side-effect
        // because we are preventing default in `onPointerDown` so effectively
        // this only runs for a label 'click'
        if (this.rootContext.open()) {
            return;
        }
        (event?.currentTarget as HTMLElement)?.focus();
    }

    onPointerDown(event: Event) {
        const pointerEvent = event as PointerEvent;
        this.triggerInteraction.recordPointerDown(pointerEvent);
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
        if (this.isDisabled() || keyEvent.isComposing) return;
        if (!this.rootContext.open() && keyEvent.key === ' ' && this.rootContext.isTypeaheadActive()) {
            if (keyEvent.ctrlKey || keyEvent.altKey || keyEvent.metaKey) {
                event.preventDefault();
                return;
            }
            if (this.rootContext.onClosedTypeahead(keyEvent)) {
                event.preventDefault();
                return;
            }
        }
        if (OPEN_KEYS.includes(keyEvent.key)) {
            const reason =
                keyEvent.key === 'ArrowUp' || keyEvent.key === 'ArrowDown' ? 'list-navigation' : 'trigger-press';
            this.handleOpen(reason, event);
            event.preventDefault();
        } else if (!this.rootContext.open() && this.rootContext.onClosedTypeahead(keyEvent)) {
            event.preventDefault();
        }
    }

    onFocus(): void {
        this.fieldRootContext?.setFocused(true);
    }

    onBlur(event?: FocusEvent): void {
        if (event) this.rootContext.onTypeaheadFocusOut(event);
        else this.rootContext.resetTypeahead();
        this.fieldRootContext?.setFocused(false);
        this.fieldRootContext?.setTouched(true);
        // Notify Signal Forms (touched model + touch output) the control was touched.
        this.rootContext.markAsTouched();
    }

    protected readonly dataAttr = attr;
}
