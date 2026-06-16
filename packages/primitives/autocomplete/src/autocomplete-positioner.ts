import { afterNextRender, Directive, ElementRef, inject, Injector } from '@angular/core';
import { setupInternalBackdrop } from '@radix-ng/primitives/core';
import {
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';
import { RdxAutocompleteRoot } from './autocomplete-root';

/**
 * Positions the autocomplete popup relative to the input anchor using the popper engine.
 *
 * A "thin" positioner (ADR 0012): it inherits the full popper positioning surface — the inputs
 * (`side`, `sideOffset`, `align`, …), the `placed` output, and the host bindings — from
 * {@link RdxPopperContentWrapper}, and only declares autocomplete's Base UI-aligned defaults through
 * the config provider (the same building block the combobox positioner uses).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompletePositioner]',
    exportAs: 'rdxAutocompletePositioner',
    providers: [
        ...provideRdxPopperContentWrapper(RdxAutocompletePositioner),
        provideRdxPopperContentConfig({ sideOffset: 4, align: 'start' })
    ]
})
export class RdxAutocompletePositioner extends RdxPopperContentWrapper {
    constructor() {
        super();
        const root = inject(RdxAutocompleteRoot);
        const injector = inject(Injector);
        const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        // A modal autocomplete isolates the background with an internal backdrop (Base UI); the input stays
        // clickable through a cutout. (Autocomplete is non-modal by default — usually no backdrop.)
        afterNextRender(() =>
            setupInternalBackdrop(host, injector, {
                isOpen: () => root.open(),
                shouldRender: () => root.modal(),
                cutout: () => root.inputElement() ?? null
            })
        );
    }
}
