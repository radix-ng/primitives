import { DestroyRef, Directive, effect, ElementRef, inject, untracked } from '@angular/core';
import { useScrollLock } from '@radix-ng/primitives/core';
import { provideRdxDismissableLayerConfig, RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
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
    hostDirectives: [RdxPopperContent, RdxDismissableLayer],
    providers: [
        // In modal mode, make content outside the popup inert (Base UI's `modal`).
        provideRdxDismissableLayerConfig(() => ({ disableOutsidePointerEvents: injectComboboxRootContext().modal }))
    ],
    host: {
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.open() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined'
    }
})
export class RdxComboboxPopup {
    protected readonly rootContext = injectComboboxRootContext();
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly popper = injectPopperContentWrapperContext();
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    constructor() {
        // The popup mounts only while open, so locking on `modal` locks scroll for as long as a modal
        // popup is open and releases it on close.
        useScrollLock(this.rootContext.modal);

        // The popup's animation determines when the open/close transition (onOpenChangeComplete) is done.
        const unregister = this.rootContext.registerTransitionElement(this.element);
        inject(DestroyRef).onDestroy(unregister);

        // The input keeps focus while the popup is open; it is registered as a layer branch, so
        // focus/pointer interactions on it don't count as "outside" and won't self-dismiss. Escape
        // is handled by the input (which calls preventDefault), so the layer won't dismiss for it.
        this.dismissableLayer.dismiss.subscribe(() => this.rootContext.closePopup(true));

        // For the "input inside the popup" pattern, move focus to the input once the popup is
        // positioned. Focusing earlier fails in the browser: the portal `appendChild` blurs the
        // input and an unplaced popup isn't yet visible/focusable.
        effect(() => {
            if (!this.popper.isPositioned() || !this.rootContext.open()) {
                return;
            }
            const input = this.rootContext.inputElement();
            if (input && input.closest('[rdxComboboxPopup]')) {
                untracked(() => {
                    input.focus();
                    input.select();
                });
            }
        });
    }
}
