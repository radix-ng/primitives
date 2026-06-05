import { Directive } from '@angular/core';
import { RdxDialogViewport } from '@radix-ng/primitives/dialog';

/**
 * A scrollable positioning container for the alert dialog popup.
 */
@Directive({
    selector: '[rdxAlertDialogViewport]',
    exportAs: 'rdxAlertDialogViewport',
    hostDirectives: [RdxDialogViewport]
})
export class RdxAlertDialogViewport {}
