import { Directive } from '@angular/core';
import { RdxPopperArrow } from '@radix-ng/primitives/popper';

/**
 * An optional arrow that points from the popup to the anchor. Composes the popper arrow directly
 * (the same building block the combobox arrow uses).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteArrow]',
    exportAs: 'rdxAutocompleteArrow',
    hostDirectives: [{ directive: RdxPopperArrow, inputs: ['width', 'height'] }]
})
export class RdxAutocompleteArrow {}
