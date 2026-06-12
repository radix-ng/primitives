import { Directive } from '@angular/core';
import { RdxComboboxAnchor } from '@radix-ng/primitives/combobox';

/**
 * Optional positioning anchor for the popup. Put it on the element the popup should align to — for
 * example a wrapper that holds the input plus an icon/clear button. When present it takes precedence
 * over the input. Reuses the combobox anchor behavior.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteAnchor]',
    exportAs: 'rdxAutocompleteAnchor',
    hostDirectives: [RdxComboboxAnchor]
})
export class RdxAutocompleteAnchor {}
