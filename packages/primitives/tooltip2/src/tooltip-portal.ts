import { Directive, input } from '@angular/core';
import { RdxPortal, RdxPortalContainer } from '@radix-ng/primitives/portal';

@Directive({
    selector: '[rdxTooltipPortal]',
    hostDirectives: [
        {
            directive: RdxPortal,
            inputs: ['container']
        }
    ]
})
export class RdxTooltipPortal {
    readonly container = input.required<RdxPortalContainer>();
}
