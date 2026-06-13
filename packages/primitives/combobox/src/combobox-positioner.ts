import { Directive } from '@angular/core';
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
export class RdxComboboxPositioner extends RdxPopperContentWrapper {}
