import { _IdGenerator } from '@angular/cdk/a11y';
import { Directive, inject } from '@angular/core';
import { RdxCollapsibleTriggerDirective } from '@radix-ng/primitives/collapsible';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionTrigger]',
    hostDirectives: [RdxCollapsibleTriggerDirective],
    host: {
        '[id]': 'itemContext.triggerId',
        '[attr.data-rdx-collection-item]': '""',
        '[attr.role]': '"button"',
        '[attr.aria-disabled]': 'itemContext.disabled() || undefined',
        '[attr.data-orientation]': 'rootContext.orientation()'
    }
})
export class RdxAccordionTriggerDirective {
    protected readonly rootContext = injectAccordionRootContext()!;
    protected readonly itemContext = injectAccordionItemContext()!;

    constructor() {
        this.itemContext.triggerId = inject(_IdGenerator).getId('rdx-accordion-trigger-');
    }
}
