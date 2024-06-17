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
    elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
