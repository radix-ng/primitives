import { afterRenderEffect, computed, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import {
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    useAnchoredScrollLock
} from '@radix-ng/primitives/core';
import { RdxDismiss } from '@radix-ng/primitives/dismissable-layer';
import { injectPopperContentWrapperContext, RdxPopperContent } from '@radix-ng/primitives/popper';
import { RdxAutocompleteRoot } from './autocomplete-root';

/**
 * The popup surface. Composes the popper content (for `data-side` / `data-align`) and a dismissable
 * layer for outside-dismiss. It does **not** trap focus — focus stays in the input throughout. When
 * the input lives **inside** the popup (the "input in popup" / emoji-picker pattern), it moves focus
 * to the input once the popup is positioned.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompletePopup]',
    exportAs: 'rdxAutocompletePopup',
    hostDirectives: [RdxPopperContent, RdxFloatingNodeRegistration],
    host: {
        // Base UI: a `dialog` (focusable, tabindex -1) when the input lives inside the popup, otherwise
        // a presentational wrapper around the `listbox` (the List part owns the listbox role).
        tabindex: '-1',
        '[attr.role]': 'root.inputLayout() === "inside" ? "dialog" : "presentation"',
        '[attr.data-open]': 'root.open() ? "" : undefined',
        '[attr.data-closed]': 'root.open() ? undefined : ""',
        '[attr.data-empty]': 'root.visibleCount() === 0 ? "" : undefined',
        '[attr.data-starting-style]': 'root.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'root.transitionStatus() === "ending" ? "" : undefined',
        '(focusin)': 'onFocusIn($event)'
    }
})
export class RdxAutocompletePopup {
    protected readonly root = inject(RdxAutocompleteRoot);
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly popper = injectPopperContentWrapperContext();
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    constructor() {
        // Activation policy (ADR 0016 §2 + §3): lock page scroll while a modal popup is OPEN, gated on
        // `open` (not mounted) so the lock releases at close-start. For a **touch** open the anchored
        // helper only locks when the popup is effectively viewport-width (a small dropdown stays
        // swipe-to-dismissable on mobile, §3).
        useAnchoredScrollLock(
            computed(() => this.root.open() && this.root.modal()),
            {
                touchOpen: () => this.root.openedByTouch(),
                element: () => this.element
            }
        );

        const unregister = this.root.registerTransitionElement(this.element);
        // Track mounted state so Escape can tell "closing this open popup" from "already closed".
        this.root.setPopupMounted(true);
        inject(DestroyRef).onDestroy(() => {
            unregister();
            this.root.setPopupMounted(false);
        });

        // The popup is this layer's floating element (the inside surface for containment checks).
        this.floatingContext.setFloatingElement(this.element);

        // Dismissal (ADR 0015): an outside press, or focus leaving everything, closes the autocomplete. The
        // input / trigger / clear are registered as "inside" (RdxFloatingInsideElement), so the input keeping
        // focus — or a press on those parts — never self-dismisses. Escape is owned by the input (it
        // preventDefaults + closes), so the capability does not handle it (`escapeKey: false`).
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => false,
            outsidePress: () => true,
            focusOutside: () => true,
            onDismiss: (reason, event) =>
                this.root.closePopup(true, reason === 'focus-outside' ? 'focus-out' : 'outside-press', event)
        });

        // For the "input inside the popup" pattern, move focus to the input once positioned. Use
        // `afterRenderEffect` (not `effect`): when `isPositioned` flips true the popup's final
        // position/visibility is applied in the *following* render, so a synchronous `effect` would
        // call `focus()` while the element is still unfocusable and silently no-op. Running after the
        // render guarantees the input is focusable.
        afterRenderEffect(() => {
            if (!this.popper.isPositioned() || !this.root.open()) {
                return;
            }
            const input = this.root.inputElement();
            if (input && input.closest('[rdxAutocompletePopup]')) {
                // Base UI: a touch-open focuses the popup itself so Android keeps the virtual keyboard
                // closed; mouse/keyboard opens focus (and select) the search input as usual.
                if (this.root.openedByTouch()) {
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
     * working. Skipped for a touch interaction, where focus is parked on the popup to keep the Android
     * virtual keyboard closed.
     */
    onFocusIn(event: FocusEvent): void {
        if (this.root.openedByTouch()) {
            return;
        }
        const input = this.root.inputElement();
        const target = event.target as HTMLElement | null;
        if (!input || !target || target === input) {
            return;
        }
        if (target === this.element || target.matches('[rdxAutocompleteList]')) {
            input.focus();
        }
    }
}
