import { Directive, inject } from '@angular/core';
import { RdxRadioItemDirective } from './radio-item.directive';
import { RDX_RADIO_GROUP, RadioGroupDirective } from './radio-tokens';

@Directive({
    selector: '[rdxRadioIndicator]',
    exportAs: 'rdxRadioIndicator',
    standalone: true,
    host: {
        '[attr.data-state]': 'radioItem.checkedState() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'radioItem.disabled ? "" : null'
    }
})
export class RdxRadioIndicatorDirective {
    protected readonly radioGroup: RadioGroupDirective = inject(RDX_RADIO_GROUP);
    protected readonly radioItem: RdxRadioItemDirective = inject(RdxRadioItemDirective);
}
