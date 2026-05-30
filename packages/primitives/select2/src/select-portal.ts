import { Directive, input } from '@angular/core';
import { RdxPortal, RdxPortalContainer } from '@radix-ng/primitives/portal';

@Directive({
    selector: '[rdxSelectPortal]',
    hostDirectives: [
        {
            directive: RdxPortal,
            inputs: ['container']
        }
    ]
})
export class RdxSelectPortal {
    readonly container = input.required<RdxPortalContainer>();
}
