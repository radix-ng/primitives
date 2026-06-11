import { Directive } from '@angular/core';

/**
 * Decorative icon inside the trigger (e.g. a chevron). Hidden from assistive technology.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxSelectIcon]',
    exportAs: 'rdxSelectIcon',
    host: {
        'aria-hidden': 'true'
    }
})
export class RdxSelectIcon {}
