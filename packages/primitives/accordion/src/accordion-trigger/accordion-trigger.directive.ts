import { Directive, HostListener, inject } from '@angular/core';

import { RdxAccordionItemToken } from '../accordion-item/accordion-item.token';
import { RdxAccordionStateDirective } from '../accordion-state.directive';

@Directive({
    selector: '[rdxAccordionTrigger]',
    standalone: true,
    hostDirectives: [RdxAccordionStateDirective],
    host: {
        '[id]': 'triggerId',
        '[attr.aria-expanded]': 'item.isExpanded()',
        '[attr.aria-controls]': 'contentId'
    }
})
export class RdxAccordionTriggerDirective {
    /**
     * Access the item the trigger belongs to.
     */
    protected readonly item = inject(RdxAccordionItemToken);

    /**
     * Derive the id of the trigger.
     */
    protected get triggerId(): string {
        return `${this.item.id}-trigger`;
    }

    /**
     * Get the id of the item content.
     * @internal
     */
    protected readonly contentId = `${this.item.id}-content`;

    /**
     * Toggle the expanded state of the item.
     */
    @HostListener('click')
    toggle(): void {
        this.item.toggle();
    }
}
