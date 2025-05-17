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
        '[attr.aria-disabled]': 'itemContext.open() && !rootContext.collapsible() ? "true" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[disabled]': 'itemContext.disabled()',

        '(click)': 'changeItem()'
    }
})
export class RdxAccordionTriggerDirective {
    protected readonly rootContext = injectAccordionRootContext()!;
    protected readonly itemContext = injectAccordionItemContext()!;

    constructor() {
        this.itemContext.triggerId = inject(_IdGenerator).getId('rdx-accordion-trigger-');
    }

    changeItem() {
        const triggerDisabled =
            this.rootContext.isSingle() && this.itemContext.open() && !this.rootContext.collapsible();

        if (this.itemContext.disabled() || triggerDisabled) {
            this.itemContext.updateOpen();
            return;
        }

        this.rootContext.changeModelValue(this.itemContext.value()!);
    }
}
