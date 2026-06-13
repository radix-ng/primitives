import { Directive } from '@angular/core';

/**
 * A visual separator between groups of options. Carries `role="separator"` with a horizontal
 * orientation (it divides rows in a vertical list), so assistive tech announces the grouping break.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxSeparator]',
    exportAs: 'rdxComboboxSeparator',
    host: {
        role: 'separator',
        'aria-orientation': 'horizontal'
    }
})
export class RdxComboboxSeparator {}
