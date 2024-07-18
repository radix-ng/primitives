import { Directive } from '@angular/core';

import { injectCheckbox } from './checkbox.token';

@Directive({
    selector: '[CheckboxIndicator]',
    standalone: true,
    host: {
        '[style.pointer-events]': '"none"',
        '[attr.aria-checked]': 'checkbox.indeterminate ? "mixed" : checkbox.checked',
        '[attr.data-state]': 'checkbox.state',
        '[attr.data-disabled]': 'checkbox.disabled ? "" : null'
    }
})
export class RdxCheckboxIndicatorDirective {
    protected readonly checkbox = injectCheckbox();
}
