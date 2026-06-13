import { Directive } from '@angular/core';
import {
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';

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
export class RdxAutocompletePositioner extends RdxPopperContentWrapper {}
