import { Directive } from '@angular/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleTrigger]',
    host: {
        '[attr.aria-controls]': 'rootContext.contentId',
        '[attr.aria-expanded]': 'rootContext.open()',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-disabled]': 'rootContext.disabled() ? "true" : undefined',
        '[disabled]': 'rootContext.disabled()',

        '(click)': 'rootContext.onOpenToggle()'
    }
})
export class RdxCollapsibleTriggerDirective {
    protected readonly rootContext = injectCollapsibleRootContext()!;
}
