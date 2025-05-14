import { Directive } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

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
