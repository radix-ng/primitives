import { Directive, input } from '@angular/core';
import { DataOrientation } from '@radix-ng/primitives/core';

/**
 * A visual separator between groups of menu items.
 */
@Directive({
    selector: '[rdxMenuSeparator]',
    exportAs: 'rdxMenuSeparator',
    host: {
        role: 'separator',
        '[attr.aria-orientation]': 'orientation()',
        '[attr.data-orientation]': 'orientation()'
    }
})
export class RdxMenuSeparator {
    /** The orientation of the separator. Matches Base UI's `Separator.orientation`. */
    readonly orientation = input<DataOrientation>('horizontal');
}
