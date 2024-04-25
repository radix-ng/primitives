import { booleanAttribute, computed, Directive, EventEmitter, Input, Output } from '@angular/core';

import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

import { RdxAccordionStateDirective } from '../accordion-state.directive';
import { injectAccordion } from '../accordion/accordion.token';
import { RdxAccordionItemToken } from './accordion-item.token';

/**
 * A unique id for the item.
 */
let uniqueId = 0;

@Directive({
    selector: '[rdxAccordionItem]',
    standalone: true,
    providers: [{ provide: RdxAccordionItemToken, useExisting: RdxAccordionItemDirective }],
    hostDirectives: [RdxAccordionStateDirective, RdxRovingFocusItemDirective]
})
export class RdxAccordionItemDirective {
    /**
     * Access the accordion the item belongs to.
     */
    private readonly accordion = injectAccordion();

    /**
     * Determines whether the item should be expanded.
     * @default false
     */
    @Input({ alias: 'rdxAccordionItemExpanded', transform: booleanAttribute }) expanded = false;

    /**
     * Determines whether the Item should be disabled.
     * @default false
     */
    @Input({ alias: 'rdxAccordionItemDisabled', transform: booleanAttribute }) disabled = false;

    /**
     * Event emitted when the Item is expanded.
     */
    @Output('rdxAccordionItemExpandedChange') readonly expandedChange = new EventEmitter<boolean>();

    /**
     * The unique id of the Item.
     * @internal
     */
    readonly id = `rdx-accordion-item-${uniqueId++}`;

    /**
     * Determine if this item is expanded.
     * @internal
     */
    readonly isExpanded = computed(() => this.accordion.expanded().includes(this.id));

    /**
     * Toggle the expanded state of the Item.
     */
    toggle(): void {
        // If the accordion or Item is disabled, do nothing.
        if (this.accordion.disabled || this.disabled) {
            return;
        }

        if (this.isExpanded()) {
            this.accordion.collapse(this.id);
        } else {
            this.accordion.expand(this.id);
        }

        this.expandedChange.emit(this.isExpanded());
    }
}
