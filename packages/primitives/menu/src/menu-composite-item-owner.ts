import { computed, inject, Provider } from '@angular/core';
import { injectRdxCompositeListContext, provideRdxCompositeItemOwner } from '@radix-ng/primitives/composite';
import { RdxMenuRoot } from './menu-root';

/** Bridge the declaring injector tree to the popup collection, including projected wrappers. */
export function provideMenuCompositeItemOwner(submenuTrigger = false): Provider {
    return provideRdxCompositeItemOwner(() => {
        const menu = inject(RdxMenuRoot, { optional: true });
        const owner = submenuTrigger ? menu?.parentRoot : menu;
        const list = injectRdxCompositeListContext(true);
        return {
            rootContext: computed(() => null),
            // An absent popup is authoritative; do not fall back to an ancestor menu's list.
            listContext: owner ? owner.popupCompositeList : computed(() => list)
        };
    });
}
