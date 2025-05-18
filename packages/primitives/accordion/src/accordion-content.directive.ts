import { Directive } from '@angular/core';
import { RdxCollapsibleContentDirective } from '@radix-ng/primitives/collapsible';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionContent]',
    hostDirectives: [RdxCollapsibleContentDirective],
    host: {
        role: 'region',
        '[attr.aria-labelledby]': 'itemContext.triggerId',
        '[attr.data-state]': 'itemContext.dataState()',
        '[attr.data-disabled]': 'itemContext.dataDisabled()',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[style]': `{
            '--radix-accordion-content-height': 'var(--radix-collapsible-content-height)',
            '--radix-accordion-content-width': 'var(--radix-collapsible-content-width)',
          }`
    }
})
export class RdxAccordionContentDirective {
    protected readonly rootContext = injectAccordionRootContext()!;
    protected readonly itemContext = injectAccordionItemContext()!;
}
