import { Directive } from '@angular/core';

/**
 * A visual separator between groups of menu items.
 */
@Directive({
    selector: '[rdxMenuSeparator]',
    exportAs: 'rdxMenuSeparator',
    host: {
        role: 'separator',
        '[attr.aria-orientation]': '"horizontal"'
    }
})
export class RdxMenuSeparator {}
