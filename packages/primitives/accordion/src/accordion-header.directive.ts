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
    /**
     * @ignore
     */
    private readonly accordionItem = injectAccordionItem();

    /**
     * @ignore
     */
    getState(): RdxAccordionItemState {
        return this.accordionItem.state();
    }

    /**
     * @ignore
     */
    getDisabled(): string | undefined {
        return this.accordionItem.disabled() ? '' : undefined;
    }

    /**
     * @ignore
     */
    getOrientation(): RdxAccordionOrientation {
        return this.accordionItem.orientation;
    }
}
