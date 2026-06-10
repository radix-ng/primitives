import { computed, Directive } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';
import { injectCheckboxRootContext } from './checkbox-root';

@Directive({
    selector: 'ng-template[rdxCheckboxIndicatorPresence]',
    providers: [
        provideRdxPresenceContext(() => {
            const rootContext = injectCheckboxRootContext();

            return {
                present: computed(() => rootContext.checked() || rootContext.indeterminate())
            };
        })
    ],
    hostDirectives: [RdxPresenceDirective]
})
export class RdxCheckboxIndicatorPresenceDirective {}
