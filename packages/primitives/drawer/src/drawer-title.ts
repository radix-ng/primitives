import { Directive } from '@angular/core';
import { RdxDialogTitle } from '@radix-ng/primitives/dialog';

/**
 * An accessible title announced when the drawer is opened.
 */
@Directive({
    selector: '[rdxDrawerTitle]',
    exportAs: 'rdxDrawerTitle',
    hostDirectives: [RdxDialogTitle]
})
export class RdxDrawerTitle {}
