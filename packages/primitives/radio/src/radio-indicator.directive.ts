import { Directive } from '@angular/core';

import { injectRadioGroup } from './radio-group.token';
import { injectRadioItem } from './radio-item.token';

@Directive({
    selector: '[rdxRadioIndicator]',
    standalone: true,
    host: {
        '[attr.data-state]': 'radioGroup.value === this.radioItem.value ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'radioItem.disabled ? "" : null'
    }
})
export class RdxRadioIndicatorDirective {
    /**
     * Access the radio group.
     */
    protected readonly radioGroup = injectRadioGroup();

    /**
     * Access the radio group item.
     */
    protected readonly radioItem = injectRadioItem();
}
