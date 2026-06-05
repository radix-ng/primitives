import { Directive } from '@angular/core';
import { RdxCollapsiblePanelDirective } from '@radix-ng/primitives/collapsible';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionContent]',
    hostDirectives: [RdxCollapsiblePanelDirective],
    host: {
        role: 'region',
        '[attr.aria-labelledby]': 'itemContext.triggerId()',
        '[attr.data-state]': 'itemContext.dataState()',
        '[attr.data-disabled]': 'itemContext.dataDisabled() ? "" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-index]': 'itemContext.index()',
        '[style]': `{
            '--radix-accordion-content-height': 'var(--collapsible-panel-height)',
            '--radix-accordion-content-width': 'var(--collapsible-panel-width)',
          }`
    }
})
export class RdxAccordionContentDirective {
    protected readonly rootContext = injectAccordionRootContext()!;
    protected readonly itemContext = injectAccordionItemContext()!;
}
