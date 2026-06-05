import { Directive } from '@angular/core';
import { RdxDialogBackdrop } from '@radix-ng/primitives/dialog';

/**
 * An overlay displayed beneath the alert dialog popup.
 */
@Directive({
    selector: '[rdxAlertDialogBackdrop]',
    exportAs: 'rdxAlertDialogBackdrop',
    hostDirectives: [RdxDialogBackdrop]
})
export class RdxAlertDialogBackdrop {}
