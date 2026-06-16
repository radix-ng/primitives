import { afterRenderEffect, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import {
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    useScrollLock
} from '@radix-ng/primitives/core';
import { RdxDismiss } from '@radix-ng/primitives/dismissable-layer';
import { injectPopperContentWrapperContext, RdxPopperContent } from '@radix-ng/primitives/popper';
import { injectComboboxRootContext } from './combobox-root';

/**
 * The popup surface. Composes the popper content (for `data-side` / `data-align`) and a dismissable
 * layer for outside-dismiss. It does **not** trap focus — focus stays in the input throughout.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxPopup]',
    exportAs: 'rdxComboboxPopup',
    hostDirectives: [RdxPopperContent, RdxFloatingNodeRegistration],
    host: {
        // Base UI: a `dialog` (focusable, tabindex -1) when the input lives inside the popup, otherwise
        // a presentational wrapper around the `listbox` (the List part owns the listbox role).
        tabindex: '-1',
        '[attr.role]': 'rootContext.inputLayout() === "inside" ? "dialog" : "presentation"',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.open() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '(focusin)': 'onFocusIn($event)'
    }
})
export class RdxComboboxPopup {
    protected readonly rootContext = injectComboboxRootContext();
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly popper = injectPopperContentWrapperContext();
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    constructor() {
        // The popup mounts only while open, so locking on `modal` locks scroll for as long as a modal
        // popup is open and releases it on close.
        useScrollLock(this.rootContext.modal);

        // The popup's animation determines when the open/close transition (onOpenChangeComplete) is done.
        const unregister = this.rootContext.registerTransitionElement(this.element);
        // Track mounted state so Escape can tell "closing this open popup" from "already closed".
        this.rootContext.setPopupMounted(true);
        inject(DestroyRef).onDestroy(() => {
            unregister();
            this.rootContext.setPopupMounted(false);
        });

        // The popup is this layer's floating element (the inside surface for containment checks).
        this.floatingContext.setFloatingElement(this.element);

        // Dismissal (ADR 0015): an outside press, or focus leaving everything, closes the combobox. The
        // input / trigger / chips / clear are registered as "inside" (RdxFloatingInsideElement), so the
        // input keeping focus — or a press on those parts — never self-dismisses. Escape is owned by the
        // input (it preventDefaults + closes), so the capability does not handle it (`escapeKey: false`).
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => false,
            outsidePress: () => true,
            focusOutside: () => true,
            onDismiss: () => this.rootContext.closePopup(true)
        });

        // For the "input inside the popup" pattern, move focus to the input once the popup is
        // positioned. Use `afterRenderEffect` (not `effect`): when `isPositioned` flips true the
        // popup's final position/visibility is applied in the *following* render, so a synchronous
        // `effect` would call `focus()` while the element is still unfocusable and silently no-op.
        afterRenderEffect(() => {
            if (!this.popper.isPositioned() || !this.rootContext.open()) {
                return;
            }
            const input = this.rootContext.inputElement();
            if (input && input.closest('[rdxComboboxPopup]')) {
                // Base UI: a touch-open focuses the popup itself so Android keeps the virtual keyboard
                // closed; mouse/keyboard opens focus (and select) the search input as usual.
                if (this.rootContext.openedByTouch()) {
                    this.element.focus();
                } else {
                    input.focus();
                    input.select();
                }
            }
        });
    }

    /**
     * Base UI focus handoff: if focus lands on the popup or the list (the `tabindex="-1"` programmatic
     * focus targets), hand it back to the input so arrow-key navigation (`aria-activedescendant`) keeps
     * working. Skipped for a touch interaction, where focus is intentionally parked on the popup to keep
     * the Android virtual keyboard closed.
     */
    onFocusIn(event: FocusEvent): void {
        if (this.rootContext.openedByTouch()) {
            return;
        }
        const input = this.rootContext.inputElement();
        const target = event.target as HTMLElement | null;
        if (!input || !target || target === input) {
            return;
        }
        if (target === this.element || target.matches('[rdxComboboxList]')) {
            input.focus();
        }
    }
}
