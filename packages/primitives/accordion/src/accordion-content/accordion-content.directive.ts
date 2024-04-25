import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    HostBinding,
    inject
} from '@angular/core';

import { RdxAccordionItemToken } from '../accordion-item/accordion-item.token';
import { RdxAccordionStateDirective } from '../accordion-state.directive';

@Directive({
    selector: '[rdxAccordionContent]',
    standalone: true,
    host: {
        role: 'region',
        '[id]': 'id',
        '[attr.aria-labelledby]': 'labelledby',
        '[style.display]': '!item.isExpanded() ? "none": ""'
    },
    hostDirectives: [RdxAccordionStateDirective]
})
export class RdxAccordionContentDirective implements AfterViewInit {
    /**
     * Access the element ref.
     */
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Access the change detector ref.
     */
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    /**
     * Access the item the content belongs to.
     */
    protected readonly item = inject(RdxAccordionItemToken);

    /**
     * Derive the id of the content.
     * @internal
     */
    readonly id = `${this.item.id}-content`;

    /**
     * Derive the id of the trigger.
     * @internal
     */
    readonly labelledby = `${this.item.id}-trigger`;

    /**
     * Define the width of the content as a CSS variable, so it can be used in animations.
     * @internal
     */
    @HostBinding('style.--rdx-accordion-content-width.px')
    protected width = this.elementRef.nativeElement.scrollWidth;

    /**
     * Define the height of the content as a CSS variable, so it can be used in animations.
     * @internal
     */
    @HostBinding('style.--rdx-accordion-content-height.px')
    protected height = this.elementRef.nativeElement.scrollHeight;

    ngAfterViewInit(): void {
        this.updateContentSize();
    }

    /**
     * Update the size of the content.
     */
    private updateContentSize(): void {
        this.width = this.elementRef.nativeElement.scrollWidth;
        this.height = this.elementRef.nativeElement.scrollHeight;
        this.changeDetectorRef.detectChanges();
    }
}
