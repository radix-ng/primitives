import { Directive } from '@angular/core';
import { RdxDialogViewport } from '@radix-ng/primitives/dialog';

/**
 * A positioning container for the drawer popup that can be made scrollable.
 *
 * Exposes the dialog viewport's `data-nested` / `data-nested-dialog-open` state for styling.
 */
@Directive({
    selector: '[rdxDrawerViewport]',
    exportAs: 'rdxDrawerViewport',
    hostDirectives: [RdxDialogViewport]
})
export class RdxDrawerViewport {}
