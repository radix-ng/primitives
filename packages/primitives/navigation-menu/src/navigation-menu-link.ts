import { booleanAttribute, Directive, ElementRef, inject, input, output } from '@angular/core';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { ENTER, SPACE } from '@radix-ng/primitives/core';
import { provideNavigationMenuCompositeItemOwner } from './navigation-menu-composite-item-owner';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * A navigation link. Can close the menu on selection when `closeOnClick` is enabled.
 *
 * Used both as a top-level navigation item and inside content. Every link is bound to the List's
 * composite, matching Base UI's CompositeItem-backed NavigationMenu.Link; links rendered inside content
 * fall outside the list element, register with nothing and stay plain tabbable anchors.
 */
@Directive({
    selector: '[rdxNavigationMenuLink]',
    hostDirectives: [RdxCompositeItem],
    // Unconditional list ownership: a consumer `rdxCompositeRoot` around in-content links does not
    // capture them. See navigation-menu-composite-item-owner.ts for the rationale and revisit trigger.
    providers: [provideNavigationMenuCompositeItemOwner()],
    host: {
        '[attr.data-active]': 'active() ? "" : undefined',
        '[attr.aria-current]': 'active() ? "page" : undefined',
        '(click)': 'onClick($event)',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxNavigationMenuLink {
    private readonly rootContext = injectNavigationMenuRootContext();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Whether the link represents the current page.
     */
    readonly active = input(false, { transform: booleanAttribute });

    /**
     * Whether selecting the link should close the menu.
     */
    readonly closeOnClick = input(false, { transform: booleanAttribute });

    /**
     * Emits when the link is selected. Call `preventDefault()` to keep the menu open.
     */
    readonly onSelect = output<Event>();

    protected onClick(event: Event) {
        this.onSelect.emit(event);

        if (this.closeOnClick() && !event.defaultPrevented) {
            this.rootContext.close('link-press', event);
        }
    }

    protected onKeydown(event: KeyboardEvent) {
        if (event.key === ENTER || event.key === SPACE) {
            event.preventDefault();
            this.elementRef.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
    }
}
