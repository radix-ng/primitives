import { Directive, ElementRef, inject } from '@angular/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

/**
 * A button that opens and closes the collapsible panel.
 */
@Directive({
    selector: '[rdxCollapsibleTrigger]',
    host: {
        '[attr.aria-controls]': 'rootContext.open() ? rootContext.panelId() : undefined',
        '[attr.aria-expanded]': 'rootContext.open()',
        '[attr.data-panel-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.aria-disabled]': 'rootContext.disabled() ? "true" : undefined',

        '(click)': 'handleClick($event)'
    }
})
export class RdxCollapsibleTriggerDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly rootContext = injectCollapsibleRootContext();

    protected handleClick(event: MouseEvent): void {
        this.rootContext.toggle(event, this.elementRef.nativeElement);
    }
}
