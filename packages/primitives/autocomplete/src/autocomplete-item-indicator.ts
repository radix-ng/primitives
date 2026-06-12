import { Directive } from '@angular/core';
import { RdxComboboxItemIndicator } from '@radix-ng/primitives/combobox';

/**
 * Renders only when its item is selected (e.g. a checkmark). Reuses the combobox item indicator,
 * which reads the item context provided by {@link RdxAutocompleteItem}.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteItemIndicator]',
    exportAs: 'rdxAutocompleteItemIndicator',
    hostDirectives: [RdxComboboxItemIndicator]
})
export class RdxAutocompleteItemIndicator {}
