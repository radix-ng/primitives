import { Directive, inject } from '@angular/core';
import { provideRdxPopperContentConfig, RdxPopper, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';

/**
 * Positions an anchored toast against an element — the Angular counterpart of `<Toast.Positioner>`.
 * Composes the popper machinery so a toast can point at a trigger instead of living in the stack.
 *
 * Bind `anchor` (and optionally `side`/`align`/offsets) — typically from a toast's `positionerProps`.
 * It hosts its own `RdxPopper` so it is self-contained (no surrounding `rdxPopperRoot` needed), and
 * mirrors the popper measurements as friendlier CSS variables plus `data-side` / `data-align`.
 */
@Directive({
    selector: '[rdxToastPositioner]',
    exportAs: 'rdxToastPositioner',
    providers: [
        provideRdxPopperContentConfig({
            side: 'top',
            sideOffset: 8,
            align: 'center',
            arrowPadding: 6,
            collisionPadding: 8,
            updatePositionStrategy: 'always'
        })
    ],
    hostDirectives: [
        RdxPopper,
        {
            directive: RdxPopperContentWrapper,
            inputs: [
                'anchor',
                'side',
                'sideOffset',
                'align',
                'alignOffset',
                'arrowPadding',
                'avoidCollisions',
                'collisionBoundary',
                'collisionPadding',
                'sticky',
                'hideWhenDetached',
                'positionStrategy',
                'updatePositionStrategy'
            ]
        }
    ],
    host: {
        '[attr.data-side]': 'wrapper.placedSide()',
        '[attr.data-align]': 'wrapper.placedAlign()',
        '[attr.data-anchor-hidden]': 'wrapper.anchorHidden() ? "" : undefined',
        '[style.--toast-anchor-width]': '"var(--radix-popper-anchor-width)"',
        '[style.--toast-transform-origin]': '"var(--radix-popper-transform-origin)"'
    }
})
export class RdxToastPositioner {
    protected readonly wrapper = inject(RdxPopperContentWrapper);
}
