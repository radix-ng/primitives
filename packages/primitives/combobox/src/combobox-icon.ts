import { Directive } from '@angular/core';

/**
 * Decorative icon inside the trigger. Hidden from assistive technology.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxIcon]',
    exportAs: 'rdxComboboxIcon',
    host: {
        'aria-hidden': 'true'
    }
})
export class RdxComboboxIcon {}
