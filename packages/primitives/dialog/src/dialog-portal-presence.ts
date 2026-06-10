import { Directive } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * Mounts the portal while the dialog is open and waits for CSS exit keyframes before unmounting.
 */
@Directive({
    selector: 'ng-template[rdxDialogPortalPresence]',
    hostDirectives: [RdxPresenceDirective],
    providers: [
        provideRdxPresenceContext(() => {
            const context = injectRdxDialogRootContext();

            return { present: context.isOpen };
        })
    ]
})
export class RdxDialogPortalPresence {}
