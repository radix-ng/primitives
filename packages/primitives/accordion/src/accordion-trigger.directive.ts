import { Directive } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionTrigger]',
    host: {
        '[id]': 'itemContext.triggerId()',
        '[attr.role]': '"button"',
        '[attr.aria-expanded]': 'itemContext.open()',
        // Disabled triggers stay focusable (Base UI parity) — `aria-disabled`, not native `disabled`.
        '[attr.aria-disabled]': 'itemContext.dataDisabled() ? "true" : undefined',
        '[attr.data-disabled]': 'itemContext.dataDisabled() ? "" : undefined',
        '[attr.data-panel-open]': 'itemContext.open() ? "" : undefined',

        '(click)': 'changeItem($event)'
    }
})
export class RdxAccordionTriggerDirective {
    protected readonly rootContext = injectAccordionRootContext();
    protected readonly itemContext = injectAccordionItemContext();

    constructor() {
        this.itemContext.triggerId.set(injectId('rdx-accordion-trigger-'));
    }

    changeItem(event: Event) {
        // `dataDisabled` is the effective disabled state (accordion-root OR item level).
        if (this.itemContext.dataDisabled()) {
            return;
        }

        this.rootContext.changeModelValue(this.itemContext.value()!, event);
    }
}
