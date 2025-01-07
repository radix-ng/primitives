import { Directive, ElementRef, inject } from '@angular/core';
import { RdxCollapsibleContentToken } from './collapsible-content.token';
import { RdxCollapsibleRootDirective } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleContent]',
    providers: [
        {
            provide: RdxCollapsibleContentToken,
            useExisting: RdxCollapsibleContentDirective
        }
    ],
    host: {
        '[attr.data-state]': 'collapsible.getState()',
        '[attr.data-disabled]': 'getDisabled()'
    }
})
export class RdxCollapsibleContentDirective {
    protected readonly collapsible = inject(RdxCollapsibleRootDirective);

    /**
     * Reference to CollapsibleContent host element
     * @ignore
     */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    getDisabled(): string | undefined {
        return this.collapsible.disabled() ? 'disabled' : undefined;
    }
}
