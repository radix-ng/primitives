import { Directive } from '@angular/core';
import { RdxComboboxGroup } from '@radix-ng/primitives/combobox';

/**
 * Groups related options under a shared label. Hides itself when all of its items are filtered out.
 * Reuses the combobox group (and exposes the combobox group context for the label + items).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteGroup]',
    exportAs: 'rdxAutocompleteGroup',
    hostDirectives: [RdxComboboxGroup]
})
export class RdxAutocompleteGroup {}
