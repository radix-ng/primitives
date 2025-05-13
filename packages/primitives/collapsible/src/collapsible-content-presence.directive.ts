import { Directive } from '@angular/core';
import { injectCollapsibleRootContext } from '@radix-ng/primitives/collapsible';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';

@Directive({
    selector: 'ng-template[rdxCollapsibleContentPresence]',
    providers: [
        provideRdxPresenceContext(() => ({
            present: injectCollapsibleRootContext()!.open
        }))
    ],
    hostDirectives: [RdxPresenceDirective]
})
export class RdxCollapsibleContentPresenceDirective {}
