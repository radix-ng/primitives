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
    /**
     * Optional container to portal the content into. Defaults to `document.body` when not set.
     */
    readonly container = input<RdxPortalContainer>();
}
