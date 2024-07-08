import { Directive } from '@angular/core';

import { injectAccordionItem, RdxAccordionItemState } from './accordion-item.directive';
import { RdxAccordionOrientation } from './accordion-root.directive';

@Directive({
    selector: '[AccordionHeader]',
    standalone: true,
    host: {
        '[attr.data-state]': 'getState()',
        '[attr.data-disabled]': 'getDisabled()',
        '[attr.data-orientation]': 'getOrientation()'
    }
})
export class RdxAccordionHeaderDirective {
    private readonly accordionItem = injectAccordionItem();

    getState(): RdxAccordionItemState {
        return this.accordionItem.state();
    }

    getDisabled(): string | undefined {
        return this.accordionItem.disabled() ? '' : undefined;
    }

    getOrientation(): RdxAccordionOrientation {
        return this.accordionItem.orientation;
    }
}
