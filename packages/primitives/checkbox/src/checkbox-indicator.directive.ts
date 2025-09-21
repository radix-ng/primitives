import { Directive } from '@angular/core';
import { injectCheckboxRootContext } from './checkbox.directive';

@Directive({
    selector: '[rdxCheckboxIndicator]',
    host: {
        '[attr.data-state]': 'context.state()',
        '[attr.data-disabled]': 'context.disabled() ? "" : undefined',
        '[hidden]': '!context.checked()',
        '[style.pointer-events]': '"none"'
    }
})
export class RdxCheckboxIndicatorDirective {
    protected readonly context = injectCheckboxRootContext();
}
