import { Directive } from '@angular/core';
import { RdxComboboxBackdrop } from '@radix-ng/primitives/combobox';

/**
 * An overlay rendered beneath the popup in `modal` mode. Exposes `data-open` / `data-closed` for
 * animation. Reuses the combobox backdrop.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteBackdrop]',
    exportAs: 'rdxAutocompleteBackdrop',
    hostDirectives: [RdxComboboxBackdrop]
})
export class RdxAutocompleteBackdrop {}
