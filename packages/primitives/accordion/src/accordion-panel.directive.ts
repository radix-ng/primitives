import { Directive } from '@angular/core';
import {
    injectCollapsiblePanelOwnerContext,
    injectCollapsibleRootContext,
    RdxCollapsiblePanelDirective
} from '@radix-ng/primitives/collapsible';
import { rdxDevError } from '@radix-ng/primitives/core';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionPanel]',
    hostDirectives: [{ directive: RdxCollapsiblePanelDirective, inputs: ['id'] }],
    host: {
        role: 'region',
        '[attr.aria-labelledby]': 'itemContext.triggerId()',
        '[attr.data-disabled]': 'itemContext.dataDisabled() ? "" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-index]': 'itemContext.index()',
        '[attr.data-hidden]': 'itemContext.hidden() ? "" : undefined',
        // `data-open` / `data-starting-style` / `data-ending-style` and the `--collapsible-panel-*`
        // size vars come from the composed RdxCollapsiblePanelDirective.
        // Re-expose the size vars under Base UI's accordion-scoped names.
        '[style]': `{
            '--accordion-panel-height': 'var(--collapsible-panel-height)',
            '--accordion-panel-width': 'var(--collapsible-panel-width)',
          }`
    }
})
export class RdxAccordionPanelDirective {
    protected readonly rootContext = injectAccordionRootContext();
    protected readonly itemContext = injectAccordionItemContext();

    constructor() {
        const owner = injectCollapsiblePanelOwnerContext(true);
        if (owner?.root !== injectCollapsibleRootContext()) {
            rdxDevError(
                'accordion/panel-owner',
                'Apply *rdxAccordionPanelPresence to the rdxAccordionPanel host so Angular owns its complete view.',
                'components/accordion'
            );
        }
    }
}
