import { Directive } from '@angular/core';
import { RdxDialogTrigger } from '@radix-ng/primitives/dialog';

/**
 * A button that opens the alert dialog. Behaves exactly like the dialog trigger.
 */
@Directive({
    selector: 'button[rdxAlertDialogTrigger]',
    exportAs: 'rdxAlertDialogTrigger',
    hostDirectives: [
        {
            directive: RdxDialogTrigger,
            inputs: ['handle', 'payload', 'id', 'disabled']
        }
    ]
})
export class RdxAlertDialogTrigger {}
