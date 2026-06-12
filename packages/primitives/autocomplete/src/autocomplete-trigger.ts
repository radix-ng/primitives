import { Directive } from '@angular/core';
import { RdxComboboxTrigger } from '@radix-ng/primitives/combobox';

/**
 * Toggles the autocomplete popup. Carries `tabindex="-1"` so it never steals focus from the input.
 * Reuses the combobox trigger behavior.
 *
 * @group Components
 */
@Directive({
    selector: 'button[rdxAutocompleteTrigger]',
    exportAs: 'rdxAutocompleteTrigger',
    hostDirectives: [RdxComboboxTrigger]
})
export class RdxAutocompleteTrigger {}
