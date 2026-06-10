import { Directive } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionTrigger]',
    host: {
        '[id]': 'itemContext.triggerId()',
        '[attr.data-rdx-collection-item]': '""',
        '[attr.role]': '"button"',
        '[attr.aria-expanded]': 'itemContext.open()',
        '[attr.aria-disabled]': 'itemContext.open() && !rootContext.collapsible() ? "true" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-state]': 'itemContext.dataState()',
        '[attr.disabled]': 'itemContext.dataDisabled() ? "" : undefined',
        '[attr.data-panel-open]': 'itemContext.open() ? "" : undefined',
        '[attr.data-index]': 'itemContext.index()',

        '(click)': 'changeItem()'
    }
})
export class RdxAccordionTriggerDirective {
    protected readonly rootContext = injectAccordionRootContext();
    protected readonly itemContext = injectAccordionItemContext();

    constructor() {
        this.itemContext.triggerId.set(injectId('rdx-accordion-trigger-'));
    }

    changeItem() {
        // In single mode an open item stays open (unless `collapsible`), so a click on it is a no-op.
        const lockedOpen = this.rootContext.isSingle() && this.itemContext.open() && !this.rootContext.collapsible();

        // `dataDisabled` is the effective disabled state (accordion-root OR item level).
        if (this.itemContext.dataDisabled() || lockedOpen) {
            return;
        }

        this.rootContext.changeModelValue(this.itemContext.value()!);
    }
}
