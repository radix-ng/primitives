import { Directive } from '@angular/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

/**
 * A button that opens and closes the collapsible panel.
 */
@Directive({
    selector: '[rdxCollapsibleTrigger]',
    host: {
        '[attr.aria-controls]': 'rootContext.panelId()',
        '[attr.aria-expanded]': 'rootContext.open()',
        '[attr.data-panel-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.disabled]': 'rootContext.disabled() || undefined',

        '(click)': 'rootContext.toggle()'
    }
})
export class RdxCollapsibleTriggerDirective {
    protected readonly rootContext = injectCollapsibleRootContext()!;
}
