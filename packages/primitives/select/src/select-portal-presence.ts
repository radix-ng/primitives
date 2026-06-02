import { Directive } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';
import { injectSelectRootContext } from './select-root';

@Directive({
    selector: 'ng-template[rdxSelectPortalPresence]',
    hostDirectives: [RdxPresenceDirective],
    providers: [
        provideRdxPresenceContext(() => {
            const context = injectSelectRootContext()!;

            return { present: context.open };
        })
    ]
})
export class RdxSelectPortalPresence {}
