import { Directive } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * Mounts the portal while the popover is open and waits for CSS exit keyframes before unmounting.
 */
@Directive({
    selector: 'ng-template[rdxPopoverPortalPresence]',
    hostDirectives: [RdxPresenceDirective],
    providers: [
        provideRdxPresenceContext(() => {
            const context = injectRdxPopoverRootContext()!;

            return { present: context.isOpen };
        })
    ]
})
export class RdxPopoverPortalPresence {}
