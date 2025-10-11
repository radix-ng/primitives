import { Directive } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';
import { injectRdxTooltipContext } from './tooltip';

@Directive({
    selector: 'ng-template[rdxTooltipPortalPresence]',
    hostDirectives: [RdxPresenceDirective],
    providers: [
        provideRdxPresenceContext(() => {
            const context = injectRdxTooltipContext()!;

            return { present: context.isOpen };
        })
    ]
})
export class RdxTooltipPortalPresence {}
