import { booleanAttribute, Directive, HostBinding, Input, OnInit, signal } from '@angular/core';

import {
    injectRovingFocusGroup,
    RdxRovingFocusGroupDirective
} from '@radix-ng/primitives/roving-focus';

import { injectAccordionConfig } from '../accordion.config';
import { RdxAccordionToken } from './accordion.token';

/**
 * The root accordion directive that all parts should be placed within.
 */
@Directive({
    selector: '[rdxAccordion]',
    standalone: true,
    hostDirectives: [
        {
            directive: RdxRovingFocusGroupDirective,
            inputs: ['rdxRovingFocusGroupOrientation:orientation']
        }
    ],
    providers: [{ provide: RdxAccordionToken, useExisting: RdxAccordionDirective }],
    host: {
        '(focusout)': 'onTouched?.()'
    }
})
export class RdxAccordionDirective implements OnInit {
    /**
     * Access the global accordion configuration.
     */
    private readonly config = injectAccordionConfig();

    /**
     * Access the roving focus group
     */
    private readonly rovingFocusGroup = injectRovingFocusGroup();

    /**
     * Determines whether multiple items can be open simultaneously.
     * @default false
     */
    @Input({ alias: 'rdxAccordionMultiple', transform: booleanAttribute }) multiple: boolean =
        this.config.multiple;

    /**
     * The orientation of the accordion.
     * @default 'vertical'
     */
    @HostBinding('attr.data-orientation')
    @Input({ alias: 'rdxAccordionOrientation' })
    orientation: 'horizontal' | 'vertical' = this.config.orientation;

    /**
     * Determines whether the accordion should be disabled.
     * @default false
     */
    @Input({ alias: 'rdxAccordionDisabled', transform: booleanAttribute }) disabled = false;

    /**
     * Store the currently expanded item(s).
     * @internal
     */
    readonly expanded = signal<string[]>([]);

    /**
     * The touched callback.
     */
    protected onTouched?: () => void;

    ngOnInit(): void {
        this.rovingFocusGroup.setOrientation(this.orientation);
    }
    /**
     * Expand an item.
     * @param id The id of the item to expand.
     */
    expand(id: string): void {
        this.expanded.set(this.multiple ? [...this.expanded(), id] : [id]);
    }

    /**
     * Collapse an Item.
     * @param id The id of the Item to collapse.
     */
    collapse(id: string): void {
        this.expanded.set(this.expanded().filter((expandedId) => expandedId !== id));
    }

    /**
     * Toggle an item.
     * @param id The id of the item to toggle.
     */
    toggle(id: string): void {
        if (this.expanded().includes(id)) {
            this.collapse(id);
        } else {
            this.expand(id);
        }
    }

    /**
     * Collapse all items.
     */
    collapseAll(): void {
        this.expanded.set([]);
    }
}
