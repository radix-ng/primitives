import { Directive, forwardRef } from '@angular/core';
import {
    legacyPopperVars,
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';
import { RDX_SELECT_POSITIONER_TOKEN, RdxPositionerImpl } from './select-popup';

/**
 * Positions the select popup against the trigger using the popper engine.
 *
 * A "thin" positioner (ADR 0012): it inherits the full popper positioning surface — the inputs
 * (`side`, `sideOffset`, `align`, …), the `placed` output, and the host bindings — from
 * {@link RdxPopperContentWrapper}, and declares select's Base UI-aligned defaults via the config
 * provider. It also satisfies {@link RdxPositionerImpl} (via the inherited `placed`) so the popup can
 * resolve it through {@link RDX_SELECT_POSITIONER_TOKEN}, the same as the item-aligned positioner.
 */
@Directive({
    selector: '[rdxSelectPositioner]',
    providers: [
        ...provideRdxPopperContentWrapper(RdxSelectPositioner),
        provideRdxPopperContentConfig({ align: 'start', updatePositionStrategy: 'always' }),
        { provide: RDX_SELECT_POSITIONER_TOKEN, useExisting: forwardRef(() => RdxSelectPositioner) }
    ],
    host: {
        // The unified vars + placement attrs come from the wrapper (ADR 0012); only `box-sizing` and
        // the deprecated `--radix-select-*` aliases (still consumed by demos) remain here.
        '[style]': 'positionerStyle'
    }
})
export class RdxSelectPositioner extends RdxPopperContentWrapper implements RdxPositionerImpl {
    protected readonly positionerStyle = { boxSizing: 'border-box', ...legacyPopperVars('select') };
}
