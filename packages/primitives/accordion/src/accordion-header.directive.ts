import { Directive } from '@angular/core';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionHeader]',
    host: {
        '[attr.data-open]': 'itemContext.open() ? "" : undefined',
        '[attr.data-disabled]': 'itemContext.dataDisabled() ? "" : undefined',
        '[attr.data-index]': 'itemContext.index()',
        '[attr.data-closed]': 'itemContext.open() ? undefined : ""',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-hidden]': 'itemContext.hidden() ? "" : undefined'
    }
})
export class RdxAccordionHeaderDirective {
    protected readonly rootContext = injectAccordionRootContext();
    protected readonly itemContext = injectAccordionItemContext();
}
