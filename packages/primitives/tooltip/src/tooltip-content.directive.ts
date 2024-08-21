import { Directive, input } from '@angular/core';

@Directive({
    selector: '[rdxTooltipContent]',
    standalone: true
})
export class RdxTooltipContentDirective {
    sideOffset = input<number>(0);
}
