import { Directive } from '@angular/core';
import { injectCheckboxRootContext } from './checkbox';

@Directive({
    selector: '[rdxCheckboxIndicator]',
    host: {
        '[attr.data-state]': 'rootContext.state()',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[hidden]': '!rootContext.checked()',
        '[style.pointer-events]': '"none"'
    }
})
export class RdxCheckboxIndicatorDirective {
    protected readonly rootContext = injectCheckboxRootContext();
}
