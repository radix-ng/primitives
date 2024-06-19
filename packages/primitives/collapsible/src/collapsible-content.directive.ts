import { Directive, ElementRef, inject, InjectionToken } from '@angular/core';

export const RdxCollapsibleContentToken = new InjectionToken<RdxCollapsibleContentDirective>(
    'RdxCollapsibleContentToken'
);

@Directive({
    selector: '[CollapsibleContent]',
    standalone: true,
    providers: [
        { provide: RdxCollapsibleContentToken, useExisting: RdxCollapsibleContentDirective }
    ]
})
export class RdxCollapsibleContentDirective {
    /**
     * Reference to CollapsibleContent host element
     */
    elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
