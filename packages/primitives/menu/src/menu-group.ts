import { Directive } from '@angular/core';

/**
 * Groups related menu items together.
 */
@Directive({
    selector: '[rdxMenuGroup]',
    exportAs: 'rdxMenuGroup',
    host: {
        role: 'group'
    }
})
export class RdxMenuGroup {}
