import { Directive } from '@angular/core';
import { RdxPortal } from '@radix-ng/primitives/portal';

/**
 * Teleports the popup into a container (default `document.body`).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxPortal]',
    exportAs: 'rdxComboboxPortal',
    hostDirectives: [{ directive: RdxPortal, inputs: ['container'] }]
})
export class RdxComboboxPortal {}
