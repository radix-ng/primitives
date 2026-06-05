import { Directive } from '@angular/core';
import { RdxDialogDescription } from '@radix-ng/primitives/dialog';

/**
 * An accessible description announced when the drawer is opened.
 */
@Directive({
    selector: '[rdxDrawerDescription]',
    exportAs: 'rdxDrawerDescription',
    hostDirectives: [RdxDialogDescription]
})
export class RdxDrawerDescription {}
