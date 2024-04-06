import { Directive } from '@angular/core';
import { injectCheckbox } from './stories/checkbox.token';

@Directive({
    selector: '[kbqCheckboxIndicator]',
    standalone: true,
    host: {
        '[style.pointer-events]': '"none"',
        '[attr.data-state]': 'checkbox.state',
        '[attr.data-disabled]': 'checkbox.disabled ? "" : null',
        type: 'checkbox',
        '[attr.aria-hidden]': 'true'
    }
})
export class CheckboxIndicatorDirective {
    protected readonly checkbox = injectCheckbox();
}
