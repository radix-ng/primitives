import { Directive } from '@angular/core';
import {
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';

/**
 * Positions an anchored toast against an element — the Angular counterpart of `<Toast.Positioner>`.
 *
 * A "thin" positioner (ADR 0012): it inherits the popper positioning surface (inputs, `placed`
 * output, unified vars + placement attrs) from {@link RdxPopperContentWrapper}. Bind `anchor` (and
 * optionally `side`/`align`/offsets) — typically from a toast's `positionerProps`. It also composes
 * its own {@link RdxPopper} so it is self-contained (no surrounding `rdxPopperRoot` needed), and
 * mirrors the anchor width / transform origin as friendlier `--toast-*` CSS variables.
 */
@Directive({
    selector: '[rdxToastPositioner]',
    exportAs: 'rdxToastPositioner',
    providers: [
        ...provideRdxPopperContentWrapper(RdxToastPositioner),
        provideRdxPopperContentConfig({
            side: 'top',
            sideOffset: 8,
            align: 'center',
            arrowPadding: 6,
            collisionPadding: 8,
            updatePositionStrategy: 'always'
        })
    ],
    hostDirectives: [RdxPopper],
    host: {
        // `data-side`/`data-align`/`data-anchor-hidden` and the unified vars come from the inherited
        // wrapper (ADR 0012); only toast's own `--toast-*` aliases remain.
        '[style.--toast-anchor-width]': '"var(--radix-popper-anchor-width)"',
        '[style.--toast-transform-origin]': '"var(--radix-popper-transform-origin)"'
    }
})
export class RdxToastPositioner extends RdxPopperContentWrapper {}
