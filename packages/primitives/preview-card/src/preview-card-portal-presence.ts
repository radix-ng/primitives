import { Directive } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';
import { injectRdxPreviewCardRootContext } from './preview-card-root';

/**
 * Mounts the portal while the preview-card is open and waits for CSS exit keyframes before unmounting.
 */
@Directive({
    selector: 'ng-template[rdxPreviewCardPortalPresence]',
    hostDirectives: [RdxPresenceDirective],
    providers: [
        provideRdxPresenceContext(() => {
            const context = injectRdxPreviewCardRootContext()!;

            return { present: context.isOpen };
        })
    ]
})
export class RdxPreviewCardPortalPresence {}
