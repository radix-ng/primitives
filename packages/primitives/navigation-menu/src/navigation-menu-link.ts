import { booleanAttribute, Directive, ElementRef, inject, input, output } from '@angular/core';
import { ENTER, SPACE } from '@radix-ng/primitives/core';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * A navigation link. Closes the menu on selection unless prevented.
 *
 * Used both as a top-level menubar item and inside content. It is a plain tabbable anchor (not part
 * of the menubar's arrow-key roving), matching Base UI.
 */
@Directive({
    selector: '[rdxNavigationMenuLink]',
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
    readonly closeOnClick = input(true, { transform: booleanAttribute });

    /**
     * Emits when the link is selected. Call `preventDefault()` to keep the menu open.
     */
    readonly onSelect = output<Event>();

    protected onClick(event: Event) {
        this.onSelect.emit(event);

        if (this.closeOnClick() && !event.defaultPrevented) {
            this.rootContext.close('link-select', event);
        }
    }

    protected onKeydown(event: KeyboardEvent) {
        if (event.key === ENTER || event.key === SPACE) {
            event.preventDefault();
            this.elementRef.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
    }
}
