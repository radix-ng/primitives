import { Directive } from '@angular/core';
import { injectComboboxItemContext } from './combobox-item';

/**
 * Renders only when its item is selected (e.g. a checkmark).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxItemIndicator]',
    exportAs: 'rdxComboboxItemIndicator',
    host: {
        'aria-hidden': 'true',
        '[hidden]': '!itemContext.isSelected()'
    }
})
export class RdxComboboxItemIndicator {
    protected readonly itemContext = injectComboboxItemContext();
}
