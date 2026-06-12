import { Directive, isDevMode } from '@angular/core';
import { RdxDialogPortal } from '@radix-ng/primitives/dialog';

/**
 * Structural directive that teleports the alert dialog content (backdrop + popup) into a container
 * (default `document.body`) while the dialog is open, keeping it mounted until its CSS exit
 * `@keyframes` finish. It composes the structural {@link RdxDialogPortal}, inheriting the dialog
 * presence context.
 *
 * Use the explicit `<ng-template rdxAlertDialogPortal>` form; pass `[container]` for a custom target.
 */
@Directive({
    selector: 'ng-template[rdxAlertDialogPortal]',
    exportAs: 'rdxAlertDialogPortal',
    hostDirectives: [{ directive: RdxDialogPortal, inputs: ['container'] }]
})
export class RdxAlertDialogPortal {}

/**
 * Dev-mode guard: `rdxAlertDialogPortal` is now structural, so the old `<div rdxAlertDialogPortal>`
 * markup would silently stop portaling — fail loudly instead.
 */
@Directive({
    selector: '[rdxAlertDialogPortal]:not(ng-template)'
})
export class RdxAlertDialogPortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            throw new Error(
                '[rdxAlertDialogPortal] is now a structural directive. ' +
                    'Use `<ng-template rdxAlertDialogPortal>` around the backdrop and popup. ' +
                    'rdxAlertDialogPortalPresence has been removed. See https://radix-ng.com/components/alert-dialog.md'
            );
        }
    }
}
