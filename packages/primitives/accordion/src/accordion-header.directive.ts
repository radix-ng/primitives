import { Directive, inject } from '@angular/core';
import { RdxAccordionItemDirective } from './accordion-item.directive';

@Directive({
    selector: '[rdxAccordionHeader]',
    standalone: true,
    host: {
        '[attr.data-state]': 'item.getState()',
        '[attr.data-disabled]': 'item.disabled ?? ""',
        '[attr.data-orientation]': 'item.orientation'
    }
})
export class RdxAccordionHeaderDirective {
    protected readonly item = inject(RdxAccordionItemDirective);
}
