import { Directive } from '@angular/core';

import { RdxOverlayArrowDirective } from '@radix-ng/primitives/overlay';

@Directive({
    selector: '[rdxTooltipArrow]',
    standalone: true,
    hostDirectives: [RdxOverlayArrowDirective]
})
export class RdxTooltipArrowDirective {}
