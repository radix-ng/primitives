import { Directive } from '@angular/core';
import { RdxDialogPortal } from '@radix-ng/primitives/dialog';

/**
 * Moves the drawer to a different part of the DOM. Defaults to `document.body`.
 */
@Directive({
    selector: '[rdxDrawerPortal]',
    exportAs: 'rdxDrawerPortal',
    hostDirectives: [
        {
            directive: RdxDialogPortal,
            inputs: ['container']
        }
    ]
})
export class RdxDrawerPortal {}
