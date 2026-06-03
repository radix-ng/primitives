import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';
import { Directive } from '@angular/core';
import { RdxCollapsiblePanelDirective } from '@radix-ng/primitives/collapsible';

@Directive({
    selector: '[rdxAccordionPanel]',
    hostDirectives: [RdxCollapsiblePanelDirective],
    host: {
        role: 'region',
        '[attr.aria-labelledby]': 'itemContext.triggerId()',
        '[attr.data-disabled]': 'itemContext.dataDisabled() ? "" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-index]': 'itemContext.index()',
        // Base UI's accordion panel exposes `data-open` (no `data-closed`) — suppress the
        // `data-closed` the composed RdxCollapsiblePanelDirective would otherwise add.
        '[attr.data-closed]': 'undefined',
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
}
