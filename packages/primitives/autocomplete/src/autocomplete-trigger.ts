import { Directive } from '@angular/core';
import { RdxComboboxTrigger } from '@radix-ng/primitives/combobox';

/**
 * Toggles the autocomplete popup. Reuses the combobox trigger: a `tabindex="-1"` toggle when the input
 * sits outside the popup, or the focusable `role="combobox"` control when the input is inside it.
 *
 * @group Components
 */
@Directive({
    selector: 'button[rdxAutocompleteTrigger]',
    exportAs: 'rdxAutocompleteTrigger',
    hostDirectives: [RdxComboboxTrigger]
})
export class RdxAutocompleteTrigger {}
