import { Directive } from '@angular/core';
import { RdxPopperArrow } from '@radix-ng/primitives/popper';

/**
 * An optional arrow that points from the popup to the anchor. Composes the popper arrow, which keeps
 * it aligned as the popup flips sides.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxArrow]',
    exportAs: 'rdxComboboxArrow',
    hostDirectives: [{ directive: RdxPopperArrow, inputs: ['width', 'height'] }]
})
export class RdxComboboxArrow {}
