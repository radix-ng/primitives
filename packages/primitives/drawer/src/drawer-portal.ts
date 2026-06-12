import { Directive, isDevMode } from '@angular/core';
import { RdxDialogPortal } from '@radix-ng/primitives/dialog';

/**
 * Structural directive that teleports the drawer content (backdrop + popup) into a container (default
 * `document.body`) while the drawer is open, keeping it mounted until its CSS exit `@keyframes`
 * finish. It composes the structural {@link RdxDialogPortal}, inheriting the dialog presence context.
 *
 * Use the explicit `<ng-template rdxDrawerPortal>` form; pass `[container]` for a custom target.
 */
@Directive({
    selector: 'ng-template[rdxDrawerPortal]',
    exportAs: 'rdxDrawerPortal',
    hostDirectives: [{ directive: RdxDialogPortal, inputs: ['container'] }]
})
export class RdxDrawerPortal {}

/**
 * Dev-mode guard: `rdxDrawerPortal` is now structural, so the old `<div rdxDrawerPortal>` markup would
 * silently stop portaling — fail loudly instead.
 */
@Directive({
    selector: '[rdxDrawerPortal]:not(ng-template)'
})
export class RdxDrawerPortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            throw new Error(
                '[rdxDrawerPortal] is now a structural directive. ' +
                    'Use `<ng-template rdxDrawerPortal>` around the backdrop and popup. ' +
                    'rdxDrawerPortalPresence has been removed. See https://radix-ng.com/components/drawer.md'
            );
        }
    }
}
