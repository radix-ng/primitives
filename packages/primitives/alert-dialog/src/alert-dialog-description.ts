import { Directive } from '@angular/core';
import { RdxDialogDescription } from '@radix-ng/primitives/dialog';

/**
 * An accessible description for the alert dialog.
 */
@Directive({
    selector: '[rdxAlertDialogDescription]',
    exportAs: 'rdxAlertDialogDescription',
    hostDirectives: [RdxDialogDescription]
})
export class RdxAlertDialogDescription {}
