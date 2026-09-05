import { Provider } from '@angular/core';
import { provideRdxCompositeItemOwner, RdxCompositeItemOwner } from '@radix-ng/primitives/composite';
import { injectTabsRootContext } from './tabs-root-context';

/**
 * Binds every `rdxTabsTab` to the List's composite contexts, so tabs keep roving focus when a wrapper
 * component projects them into an `rdxTabsList` declared in its own template.
 *
 * The contexts are read through the Root, which therefore has to stay in the projected tabs' declaring
 * injector tree — compose `RdxTabsRoot` onto the wrapper's host rather than placing it in the wrapper's
 * template.
 */
const tabsCompositeItemOwner = (): RdxCompositeItemOwner => {
    const rootContext = injectTabsRootContext();

    return {
        rootContext: rootContext.tabCompositeRoot,
        listContext: rootContext.tabCompositeList
    };
};

export function provideTabsCompositeItemOwner(): Provider {
    return provideRdxCompositeItemOwner(tabsCompositeItemOwner);
}
