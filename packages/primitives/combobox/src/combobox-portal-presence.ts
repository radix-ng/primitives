import { Directive } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';
import { injectComboboxRootContext } from './combobox-root';

/**
 * Wraps the popup template in {@link RdxPresenceDirective} so it mounts/unmounts with the open state
 * and can run enter/leave animations.
 *
 * @group Components
 */
@Directive({
    selector: 'ng-template[rdxComboboxPortalPresence]',
    hostDirectives: [RdxPresenceDirective],
    providers: [
        provideRdxPresenceContext(() => {
            const context = injectComboboxRootContext();
            return { present: context.open };
        })
    ]
})
export class RdxComboboxPortalPresence {}
