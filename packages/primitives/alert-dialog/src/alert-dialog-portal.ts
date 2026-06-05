import { Directive } from '@angular/core';
import { RdxDialogPortal } from '@radix-ng/primitives/dialog';

/**
 * Moves the alert dialog to a different part of the DOM. Defaults to `document.body`.
 */
@Directive({
    selector: '[rdxAlertDialogPortal]',
    exportAs: 'rdxAlertDialogPortal',
    hostDirectives: [
        {
            directive: RdxDialogPortal,
            inputs: ['container']
        }
    ]
})
export class RdxAlertDialogPortal {}
