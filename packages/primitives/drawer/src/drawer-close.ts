import { Directive } from '@angular/core';
import { RdxDialogClose } from '@radix-ng/primitives/dialog';

/**
 * A button that closes the drawer.
 */
@Directive({
    selector: 'button[rdxDrawerClose]',
    exportAs: 'rdxDrawerClose',
    hostDirectives: [RdxDialogClose]
})
export class RdxDrawerClose {}
