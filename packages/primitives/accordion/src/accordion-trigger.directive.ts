import { Directive } from '@angular/core';
import { injectCollapsibleRootContext } from '@radix-ng/primitives/collapsible';
import { injectId } from '@radix-ng/primitives/core';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionTrigger]',
    host: {
        '[id]': 'itemContext.triggerId()',
        '[attr.role]': '"button"',
        '[attr.aria-expanded]': 'itemContext.open()',
        // Point at the panel only while open — the panel unmounts when closed, so referencing a
        // missing id would be an invalid ARIA relationship. The id comes from the composed
        // collapsible root (the same id the accordion panel renders).
        '[attr.aria-controls]': 'itemContext.open() ? collapsibleContext.panelId() : undefined',
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
    protected readonly collapsibleContext = injectCollapsibleRootContext();

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
