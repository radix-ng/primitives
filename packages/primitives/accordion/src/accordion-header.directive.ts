import { injectAccordionItemContext } from './accordion-item.directive';
import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxAccordionHeader]',
    host: {
        '[attr.data-open]': 'itemContext.open() ? "" : undefined',
        '[attr.data-disabled]': 'itemContext.dataDisabled() ? "" : undefined',
        '[attr.data-index]': 'itemContext.index()'
    }
})
export class RdxAccordionHeaderDirective {
    protected readonly itemContext = injectAccordionItemContext();
}
