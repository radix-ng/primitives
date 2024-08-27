import { Directive, inject, InjectionToken } from '@angular/core';
import { RdxAccordionItemDirective } from './accordion-item.directive';

export const RdxAccordionContentToken = new InjectionToken<RdxAccordionContentDirective>('RdxAccordionContentToken');

@Directive({
    selector: '[rdxAccordionContent]',
    standalone: true,
    exportAs: 'rdxAccordionContent',
    host: {
        '[attr.role]': '"region"',
        '[style.display]': 'item.expanded ? "" : "none"',
        '[attr.data-state]': 'item.getState()',
        '[attr.data-disabled]': 'item.disabled ?? ""',
        '[attr.data-orientation]': 'item.orientation'
    }
})
export class RdxAccordionContentDirective {
    protected readonly item = inject(RdxAccordionItemDirective);
}
