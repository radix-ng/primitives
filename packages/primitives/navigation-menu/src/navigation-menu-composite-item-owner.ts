import { ElementRef, inject, Provider } from '@angular/core';
import { provideRdxCompositeItemOwner, RdxCompositeItemOwner } from '@radix-ng/primitives/composite';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * Binds top-level parts to the List's composite even through a wrapper's content projection.
 * Like Base UI's part props overriding CompositeItem, triggers keep tabindex=0 and links retain
 * native tab order. The composite still owns registration, focus tracking and arrow navigation.
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
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const tabIndex = element.getAttribute('tabindex') ?? (element.matches('[rdxNavigationMenuTrigger]') ? 0 : null);

    return {
        rootContext: rootContext.listCompositeRoot,
        listContext: rootContext.listCompositeList,
        tabIndex: () => tabIndex
    };
};

export function provideNavigationMenuCompositeItemOwner(): Provider {
    return provideRdxCompositeItemOwner(navigationMenuCompositeItemOwner);
}
