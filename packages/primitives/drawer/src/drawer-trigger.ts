import { Directive } from '@angular/core';
import { RdxDialogTrigger } from '@radix-ng/primitives/dialog';

/**
 * A button that opens the drawer. Behaves exactly like the dialog trigger.
 */
@Directive({
    selector: 'button[rdxDrawerTrigger]',
    exportAs: 'rdxDrawerTrigger',
    hostDirectives: [
        {
            directive: RdxDialogTrigger,
            inputs: ['handle', 'payload', 'id', 'disabled']
        }
    ]
})
export class RdxDrawerTrigger {}
