import { Directive } from '@angular/core';
import { injectCheckbox } from './checkbox.token';

@Directive({
    selector: '[rdxCheckboxIndicator]',
    standalone: true,
    host: {
        '[style.pointer-events]': '"none"',
        '[attr.data-state]': 'checkbox.state',
        '[attr.data-disabled]': 'checkbox.disabled ? "" : null'
    }
})
export class CheckboxIndicatorDirective {
    protected readonly checkbox = injectCheckbox();
}
