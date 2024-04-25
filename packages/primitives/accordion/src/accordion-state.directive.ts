import { computed, Directive } from '@angular/core';

import { injectAccordionItem } from './accordion-item/accordion-item.token';
import { injectAccordion } from './accordion/accordion.token';

@Directive({
    standalone: true,
    host: {
        '[attr.data-state]': 'state()',
        '[attr.data-disabled]': 'isDisabled',
        '[attr.data-orientation]': 'orientation'
    }
})
export class RdxAccordionStateDirective {
    /**
     * Access the accordion the trigger belongs to.
     */
    private readonly accordion = injectAccordion();

    /**
     * Access the item the trigger belongs to.
     */
    private readonly item = injectAccordionItem();

    /**
     * Determine the expanded state of the item.
     * @internal
     */
    readonly state = computed(() => (this.item.isExpanded() ? 'open' : 'closed'));

    /**
     * Determine the disabled state of the item.
     * @internal
     */
    get isDisabled(): boolean {
        return this.item.disabled || this.accordion.disabled;
    }

    /**
     * Determine the orientation of the accordion.
     * @internal
     */
    get orientation(): 'horizontal' | 'vertical' {
        return this.accordion.orientation;
    }
}
