import { Directive, inject } from '@angular/core';
import { RdxRadioItemDirective } from './radio-item.directive';
import { RDX_RADIO_GROUP, RadioGroupDirective } from './radio-tokens';

@Directive({
    selector: '[rdxRadioIndicator]',
    exportAs: 'rdxRadioIndicator',
    host: {
        '[attr.data-state]': 'radioItem.checkedState() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'radioItem.disabled ? "" : undefined'
    }
})
export class RdxRadioIndicatorDirective {
    protected readonly radioGroup: RadioGroupDirective = inject(RDX_RADIO_GROUP);
    protected readonly radioItem: RdxRadioItemDirective = inject(RdxRadioItemDirective);
}
