import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
    selector: '[rdxTooltipContent]',
    standalone: true,
    host: {
        '[attr.data-state]': '"delayed-open"',
        '[attr.data-side]': '"top"'
    }
})
export class RdxTooltipContentDirective {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);
    sideOffset = input<number>(0);
}
