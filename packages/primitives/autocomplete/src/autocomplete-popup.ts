import { afterRenderEffect, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { useScrollLock } from '@radix-ng/primitives/core';
import { provideRdxDismissableLayerConfig, RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
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
    hostDirectives: [RdxPopperContent, RdxDismissableLayer],
    providers: [
        provideRdxDismissableLayerConfig(() => ({
            disableOutsidePointerEvents: inject(RdxAutocompleteRoot).modal
        }))
    ],
    host: {
        // Base UI: a `dialog` (focusable, tabindex -1) when the input lives inside the popup, otherwise
        // a presentational wrapper around the `listbox` (the List part owns the listbox role).
        tabindex: '-1',
        '[attr.role]': 'root.inputLayout() === "inside" ? "dialog" : "presentation"',
        '[attr.data-state]': 'root.open() ? "open" : "closed"',
        '[attr.data-open]': 'root.open() ? "" : undefined',
        '[attr.data-closed]': 'root.open() ? undefined : ""',
        '[attr.data-starting-style]': 'root.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'root.transitionStatus() === "ending" ? "" : undefined',
        '(focusin)': 'onFocusIn($event)'
    }
})
export class RdxAutocompletePopup {
    protected readonly root = inject(RdxAutocompleteRoot);
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly popper = injectPopperContentWrapperContext();
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    constructor() {
        useScrollLock(this.root.modal);

        const unregister = this.root.registerTransitionElement(this.element);
        // Track mounted state so Escape can tell "closing this open popup" from "already closed".
        this.root.setPopupMounted(true);
        inject(DestroyRef).onDestroy(() => {
            unregister();
            this.root.setPopupMounted(false);
        });

        this.dismissableLayer.dismiss.subscribe(() => this.root.closePopup(true));

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
