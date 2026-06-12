import { Directive } from '@angular/core';
import { RdxComboboxIcon } from '@radix-ng/primitives/combobox';

/**
 * Decorative icon inside the trigger. Hidden from assistive technology. Reuses the combobox icon.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteIcon]',
    exportAs: 'rdxAutocompleteIcon',
    hostDirectives: [RdxComboboxIcon]
})
export class RdxAutocompleteIcon {}
