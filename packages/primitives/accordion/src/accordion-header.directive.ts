import { Directive } from '@angular/core';
import { injectAccordionItemContext } from './accordion-item.directive';

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
