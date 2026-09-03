import { Provider } from '@angular/core';
import { provideRdxCompositeItemOwner, RdxCompositeItemOwner } from '@radix-ng/primitives/composite';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

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
