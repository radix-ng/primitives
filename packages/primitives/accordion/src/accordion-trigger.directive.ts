import { Directive, ElementRef, inject } from '@angular/core';
import { RdxAccordionItemDirective } from './accordion-item.directive';
import { RdxAccordionRootDirective } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionTrigger]',
    standalone: true,
    host: {
        '[attr.role]': '"button"',
        '[attr.aria-expanded]': 'item.expanded',
        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.disabled]': 'item.disabled ? "" : null',
        '[attr.data-orientation]': 'item.orientation',
        '(click)': 'onClick()'
    }
})
export class RdxAccordionTriggerDirective {
    protected readonly nativeElement = inject(ElementRef).nativeElement;
    protected readonly accordionRoot = inject(RdxAccordionRootDirective);
    protected readonly item = inject(RdxAccordionItemDirective);

    /**
     * Fires when trigger clicked
     */
    onClick(): void {
        if (!this.accordionRoot.collapsible && this.item.expanded) return;

        this.item.toggle();

        this.accordionRoot.setActiveItem(this.item);
    }

    focus() {
        this.nativeElement.focus();
    }
}
