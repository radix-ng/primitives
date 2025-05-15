import { Directive } from '@angular/core';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionHeader]',
    host: {
        '[attr.data-state]': 'itemContext.dataState()',
        '[attr.data-disabled]': 'itemContext.dataDisabled()',
        '[attr.data-orientation]': 'rootContext.orientation()'
    }
})
export class RdxAccordionHeaderDirective {
    protected readonly rootContext = injectAccordionRootContext()!;
    protected readonly itemContext = injectAccordionItemContext()!;
}
