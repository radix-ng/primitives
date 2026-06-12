import { Directive } from '@angular/core';
import { RdxComboboxPortalPresence } from '@radix-ng/primitives/combobox';

/**
 * Wraps the popup template in a presence directive so it mounts/unmounts with the open state and can
 * run enter/leave animations. Reuses the combobox portal-presence (which reads the open state from
 * the combobox root context provided by {@link RdxAutocompleteRoot}).
 *
 * @group Components
 */
@Directive({
    selector: 'ng-template[rdxAutocompletePortalPresence]',
    hostDirectives: [RdxComboboxPortalPresence]
})
export class RdxAutocompletePortalPresence {}
