import { Directive } from '@angular/core';
import { OverlayArrowDirective } from '@radix-ng/primitives/overlay';

@Directive({
    selector: '[rdxTooltipArrow]',
    standalone: true,
    hostDirectives: [OverlayArrowDirective]
})
export class TooltipArrowDirective {}
