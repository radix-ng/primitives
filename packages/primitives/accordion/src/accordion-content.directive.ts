import { Directive, inject, InjectionToken } from '@angular/core';
import { RdxAccordionItemDirective } from './accordion-item.directive';

export const RdxAccordionContentToken = new InjectionToken<RdxAccordionContentDirective>('RdxAccordionContentToken');

@Directive({
    selector: '[rdxAccordionContent]',
    standalone: true,
    exportAs: 'rdxAccordionContent',
    host: {
        '[attr.role]': '"region"',
        // todo need hide content after animation
        // '[style.display]': 'item.expanded ? "" : "none"',
        // '[attr.hidden]': 'hidden ? "" : null',
        '[style]': 'style',
        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation'
    }
})
export class RdxAccordionContentDirective {
    protected readonly item = inject(RdxAccordionItemDirective);

    get style() {
        if (this.item.orientation === 'horizontal') {
            return { width: this.item.expanded ? 'var(--rdx-accordion-content-width)' : 0 };
        }

        return { height: this.item.expanded ? 'var(--rdx-accordion-content-height)' : 0 };
    }
}
