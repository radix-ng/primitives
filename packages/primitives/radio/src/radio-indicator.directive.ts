import { Directive } from '@angular/core';

import { injectRadioItem } from './radio-item.directive';
import { injectRadioGroup } from './radio-root.directive';

@Directive({
    selector: '[RadioIndicator]',
    exportAs: 'RadioIndicator',
    standalone: true,
    host: {
        '[attr.data-state]': 'radioGroup.value === this.radioItem.value ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'radioItem.disabled ? "" : null'
    }
})
export class RdxRadioIndicatorDirective {
    protected readonly radioGroup = injectRadioGroup();

    protected readonly radioItem = injectRadioItem();
}
