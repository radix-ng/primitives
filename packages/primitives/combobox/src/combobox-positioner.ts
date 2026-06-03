import { injectComboboxRootContext } from './combobox-root';
import { afterNextRender, Directive, ElementRef, inject, Injector } from '@angular/core';
import { setupInternalBackdrop } from '@radix-ng/primitives/core';
import {
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';

/**
 * Positions the combobox popup relative to the input anchor using the popper engine.
 *
 * A "thin" positioner (ADR 0012): it inherits the full popper positioning surface — the inputs
 * (`side`, `sideOffset`, `align`, …), the `placed` output, and the host bindings — from
 * {@link RdxPopperContentWrapper}, and only declares combobox's Base UI-aligned defaults through the
 * config provider. `provideRdxPopperContentWrapper` re-wires the `useExisting` alias + context that
 * the popup and arrow resolve (Angular does not inherit a base directive's `providers`).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxPositioner]',
    exportAs: 'rdxComboboxPositioner',
    providers: [
        ...provideRdxPopperContentWrapper(RdxComboboxPositioner),
        provideRdxPopperContentConfig({ sideOffset: 4, align: 'start' })
    ]
})
export class RdxComboboxPositioner extends RdxPopperContentWrapper {
    constructor() {
        super();
        const rootContext = injectComboboxRootContext();
        const injector = inject(Injector);
        const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        // A modal combobox isolates the background with an internal backdrop (Base UI); the input stays
        // clickable through a cutout. (Combobox is non-modal by default — usually no backdrop.)
        afterNextRender(() =>
            setupInternalBackdrop(host, injector, {
                isOpen: () => rootContext.open(),
                shouldRender: () => rootContext.modal(),
                cutout: () => rootContext.inputElement() ?? null
            })
        );
    }
}
