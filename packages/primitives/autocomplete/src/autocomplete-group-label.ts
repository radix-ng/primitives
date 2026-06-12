import { Directive } from '@angular/core';
import { RdxComboboxGroupLabel } from '@radix-ng/primitives/combobox';

/**
 * Accessible label for a {@link RdxAutocompleteGroup}. Wires itself up via `aria-labelledby`. Reuses
 * the combobox group label.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteGroupLabel]',
    exportAs: 'rdxAutocompleteGroupLabel',
    hostDirectives: [RdxComboboxGroupLabel]
})
export class RdxAutocompleteGroupLabel {}
