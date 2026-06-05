import { Directive } from '@angular/core';
import { RdxDialogPopup } from '@radix-ng/primitives/dialog';

/**
 * A container for the alert dialog contents. Wraps the dialog popup, which reads alert semantics
 * (role, modal, dismissal) from the alert root's variant.
 */
@Directive({
    selector: '[rdxAlertDialogPopup]',
    exportAs: 'rdxAlertDialogPopup',
    hostDirectives: [
        {
            directive: RdxDialogPopup,
            outputs: [
                'escapeKeyDown',
                'pointerDownOutside',
                'focusOutside',
                'interactOutside',
                'openAutoFocus',
                'closeAutoFocus'
            ]
        }
    ]
})
export class RdxAlertDialogPopup {}
