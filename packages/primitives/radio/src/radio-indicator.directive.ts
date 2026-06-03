import { Directive, inject } from '@angular/core';
import { RdxRadioItemDirective } from './radio-item.directive';
import { RDX_RADIO_GROUP, RadioGroupDirective } from './radio-tokens';

@Directive({
    selector: '[rdxRadioIndicator]',
    exportAs: 'rdxRadioIndicator',
    host: {
        '[attr.data-checked]': 'radioItem.checkedState() ? "" : undefined',
        '[attr.data-unchecked]': '!radioItem.checkedState() ? "" : undefined',
        '[attr.data-state]': 'radioItem.checkedState() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'radioItem.disabledState() ? "" : undefined',
        '[attr.data-readonly]': 'radioItem.readonlyState() ? "" : undefined',
        '[attr.data-required]': 'radioItem.requiredState() ? "" : undefined',
        '[hidden]': '!radioItem.checkedState()',
        '[style.pointer-events]': '"none"'
    }
})
export class RdxRadioIndicatorDirective {
    protected readonly radioGroup: RadioGroupDirective = inject(RDX_RADIO_GROUP);
    protected readonly radioItem: RdxRadioItemDirective = inject(RdxRadioItemDirective);
}
