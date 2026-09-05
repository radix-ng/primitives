import { Provider } from '@angular/core';
import { provideRdxCompositeItemOwner, RdxCompositeItemOwner } from '@radix-ng/primitives/composite';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * Binds every `rdxNavigationMenuTrigger` / `rdxNavigationMenuLink` to the List's composite contexts,
 * so top-level items keep roving focus when a wrapper component projects them into a List declared in
 * its own template.
 *
 * The binding is unconditional, which is a deliberate divergence from Base UI. There, an item resolves
 * the nearest `CompositeRoot` through the React tree, and `NavigationMenu.Content` wraps its children in
 * a `CompositeRoot` of its own, so links nested in content bind to that inner root instead of the List.
 * Our `Content` has no composite root — arrow keys inside an open panel are handled by `Popup` — so
 * there is nothing nearer for an in-content link to bind to and no behavioral difference today. The one
 * scenario this rules out is a consumer wrapping in-content links in their own `rdxCompositeRoot` and
 * expecting `rdxNavigationMenuLink` to join it: the owner wins over that root.
 *
 * If `Content` ever gains a composite root for Base UI parity, make this owner conditional — items that
 * sit inside a nearer composite root must fall back to injecting it.
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
