import { Directive } from '@angular/core';
import { RdxComboboxStatus } from '@radix-ng/primitives/combobox';

/**
 * A polite live region for async status (loading, result counts) announced without moving focus.
 * Reuses the combobox status region.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteStatus]',
    exportAs: 'rdxAutocompleteStatus',
    hostDirectives: [RdxComboboxStatus]
})
export class RdxAutocompleteStatus {}
