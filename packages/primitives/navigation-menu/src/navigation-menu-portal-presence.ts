import { Directive } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * Mounts the popup while the menu is open and waits for CSS exit keyframes before unmounting.
 *
 * ```html
 * <ng-template rdxNavigationMenuPortalPresence>…</ng-template>
 * ```
 */
@Directive({
    selector: 'ng-template[rdxNavigationMenuPortalPresence]',
    hostDirectives: [RdxPresenceDirective],
    providers: [
        provideRdxPresenceContext(() => {
            const context = injectNavigationMenuRootContext()!;

            return { present: context.isOpen };
        })
    ]
})
export class RdxNavigationMenuPortalPresence {}
