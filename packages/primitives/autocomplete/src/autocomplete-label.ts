import { Directive } from '@angular/core';
import { RdxComboboxLabel } from '@radix-ng/primitives/combobox';

/**
 * An accessible label for the autocomplete. Registers its id so the input (and trigger) reference it
 * via `aria-labelledby`. Reuses the combobox label behavior.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteLabel]',
    exportAs: 'rdxAutocompleteLabel',
    hostDirectives: [RdxComboboxLabel]
})
export class RdxAutocompleteLabel {}
