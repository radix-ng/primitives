import { Directive } from '@angular/core';
import { RdxComboboxEmpty } from '@radix-ng/primitives/combobox';

/**
 * Shown only when no items match the current query. Reuses the combobox empty part.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteEmpty]',
    exportAs: 'rdxAutocompleteEmpty',
    hostDirectives: [RdxComboboxEmpty]
})
export class RdxAutocompleteEmpty {}
