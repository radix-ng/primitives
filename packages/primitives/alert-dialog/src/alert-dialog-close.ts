import { Directive } from '@angular/core';
import { RdxDialogClose } from '@radix-ng/primitives/dialog';

/**
 * A button that closes the alert dialog.
 */
@Directive({
    selector: 'button[rdxAlertDialogClose]',
    exportAs: 'rdxAlertDialogClose',
    hostDirectives: [RdxDialogClose]
})
export class RdxAlertDialogClose {}
