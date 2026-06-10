import { Directive, input } from '@angular/core';
import { RdxPortal, RdxPortalContainer } from '@radix-ng/primitives/portal';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * Moves the popover to a different part of the DOM.
 */
@Directive({
    selector: '[rdxPopoverPortal]',
    hostDirectives: [
        {
            directive: RdxPortal,
            inputs: ['container']
        }
    ],
    host: {
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"'
    }
})
export class RdxPopoverPortal {
    protected readonly rootContext = injectRdxPopoverRootContext();

    /**
     * Optional container to portal the content into. Defaults to `document.body`.
     */
    readonly container = input<RdxPortalContainer>();
}
