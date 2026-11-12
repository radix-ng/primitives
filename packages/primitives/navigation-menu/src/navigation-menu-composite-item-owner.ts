import { Provider } from '@angular/core';
import { provideRdxCompositeItemOwner, RdxCompositeItemOwner } from '@radix-ng/primitives/composite';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * Binds top-level parts to the List's composite even through a wrapper's content projection.
 *
 * Nested lists publish null contexts: their triggers belong to the surrounding content's keyboard
 * collection, matching Base UI's nested List boundary. Viewport handles content navigation in Angular,
 * including inline viewports without a Popup; these parts retain their native tab order.
 *
 * The owner remains authoritative over a consumer-supplied CompositeRoot. If Content gains a composite
 * root itself, revisit that precedence rather than accidentally registering content in the top list.
 */
const navigationMenuCompositeItemOwner = (): RdxCompositeItemOwner => {
    const rootContext = injectNavigationMenuRootContext();

    return {
        rootContext: rootContext.listCompositeRoot,
        listContext: rootContext.listCompositeList
    };
};

export function provideNavigationMenuCompositeItemOwner(): Provider {
    return provideRdxCompositeItemOwner(navigationMenuCompositeItemOwner);
}
