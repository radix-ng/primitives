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
        '[attr.data-orientation]': 'item.orientation',
        '(click)': 'onClick()'
    }
})
export class RdxAccordionTriggerDirective {
    protected readonly nativeElement = inject(ElementRef).nativeElement;

    private readonly accordionRoot = inject(RdxAccordionRootDirective);
    protected readonly item = inject(RdxAccordionItemDirective);

    /**
     * Fires when trigger clicked
     */
    onClick(): void {
        if (!this.accordionRoot.collapsible) return;

        this.item.toggle();
    }

    focus() {
        this.nativeElement.focus();
    }
}
