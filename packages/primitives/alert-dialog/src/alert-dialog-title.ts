import { Directive } from '@angular/core';
import { RdxDialogTitle } from '@radix-ng/primitives/dialog';

/**
 * An accessible title for the alert dialog.
 */
@Directive({
    selector: '[rdxAlertDialogTitle]',
    exportAs: 'rdxAlertDialogTitle',
    hostDirectives: [RdxDialogTitle]
})
export class RdxAlertDialogTitle {}
