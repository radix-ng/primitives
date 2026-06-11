import { Directive } from '@angular/core';

/**
 * A visual divider between groups of items.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxSelectSeparator]',
    exportAs: 'rdxSelectSeparator',
    host: {
        role: 'separator',
        'aria-hidden': 'true'
    }
})
export class RdxSelectSeparator {}
