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
        '[attr.data-state]': 'root.open() ? "open" : "closed"',
        '[attr.data-open]': 'root.open() ? "" : undefined',
        '[attr.data-closed]': 'root.open() ? undefined : ""',
        '[attr.data-starting-style]': 'root.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'root.transitionStatus() === "ending" ? "" : undefined'
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
        inject(DestroyRef).onDestroy(unregister);

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
                input.focus();
                input.select();
            }
        });
    }
}
