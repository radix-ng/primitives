import { Directive } from '@angular/core';

import { injectAccordionItem, RdxAccordionItemState } from './accordion-item.directive';
import { injectAccordionRoot, RdxAccordionOrientation } from './accordion-root.directive';

@Directive({
    selector: '[AccordionTrigger]',
    standalone: true,
    host: {
        '(click)': 'onClick()',
        '[attr.data-state]': 'getState()',
        '[attr.data-disabled]': 'getDisabled()',
        '[attr.data-orientation]': 'getOrientation()'
    }
})
export class RdxAccordionTriggerDirective {
    private readonly accordionRoot = injectAccordionRoot();
    private readonly accordionItem = injectAccordionItem();

    onClick(): void {
        if (!this.accordionRoot.collapsible) {
            return;
        }

        this.accordionRoot.value = [this.accordionItem];
    }

    getState(): RdxAccordionItemState {
        return this.accordionItem.state();
    }

    getDisabled(): boolean | undefined {
        return this.accordionItem.disabled() || undefined;
    }

    getOrientation(): RdxAccordionOrientation {
        return this.accordionRoot.getOrientation();
    }
}
