import { Directive } from '@angular/core';
import { RdxPortal } from '@radix-ng/primitives/portal';

/**
 * Teleports the popup into a container (default `document.body`). Composes the portal primitive
 * directly (the same building block the combobox portal uses).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompletePortal]',
    exportAs: 'rdxAutocompletePortal',
    hostDirectives: [{ directive: RdxPortal, inputs: ['container'] }]
})
export class RdxAutocompletePortal {}
