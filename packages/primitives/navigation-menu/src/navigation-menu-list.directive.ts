import { FocusKeyManager } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    AfterViewInit,
    contentChildren,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    Renderer2
} from '@angular/core';
import { TAB } from '@radix-ng/primitives/core';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus'; // Import Roving Focus Group
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuList]',
    hostDirectives: [RdxRovingFocusGroupDirective],
    host: {
        role: 'menubar',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxNavigationMenuListDirective implements AfterContentInit, AfterViewInit {
    private readonly context = injectNavigationMenu();
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly renderer = inject(Renderer2);
    private readonly rovingFocusGroup = inject(RdxRovingFocusGroupDirective, { self: true });

    /**
     * @private
     * @ignore
     */
    readonly items = contentChildren(
        forwardRef(() => RdxNavigationMenuItemDirective),
        { descendants: true }
    );

    /**
     * @ignore
     */
    protected keyManager: FocusKeyManager<RdxNavigationMenuItemDirective>;

    /**
     * @ignore
     */
    ngAfterContentInit(): void {
        const items = this.items();
        this.keyManager = new FocusKeyManager(items);

        if (this.context.orientation === 'horizontal') {
            this.keyManager.withHorizontalOrientation(this.context.dir || 'ltr');
        } else {
            this.keyManager.withVerticalOrientation();
        }
    }

    /**
     * @ignore
     */
    ngAfterViewInit() {
        this.rovingFocusGroup.orientation = this.context.orientation;
        this.rovingFocusGroup.dir = this.context.dir;

        // looping typically only applies to the root menu bar
        if (isRootNavigationMenu(this.context)) {
            this.rovingFocusGroup.loop = this.context.loop ?? false;
        } else {
            this.rovingFocusGroup.loop = false;
        }

        if (isRootNavigationMenu(this.context) && this.context.onIndicatorTrackChange) {
            const listElement = this.elementRef.nativeElement;
            const parent = listElement.parentNode;

            // ensure parent exists and list hasn't already been wrapped
            if (parent && !listElement.parentElement?.hasAttribute('data-radix-navigation-menu-list-wrapper')) {
                // create a wrapper div with relative positioning
                const wrapper = this.renderer.createElement('div');
                this.renderer.setAttribute(wrapper, 'data-radix-navigation-menu-list-wrapper', ''); // Add marker
                this.renderer.setStyle(wrapper, 'position', 'relative');

                // insert the wrapper before the list element in the parent
                this.renderer.insertBefore(parent, wrapper, listElement);

                // move the list element inside the new wrapper
                this.renderer.appendChild(wrapper, listElement);

                // register the wrapper element as the track for the indicator positioning
                this.context.onIndicatorTrackChange(wrapper);
            } else if (listElement.parentElement?.hasAttribute('data-radix-navigation-menu-list-wrapper')) {
                // if wrapper somehow already exists, ensure context has the correct reference
                this.context.onIndicatorTrackChange(listElement.parentElement);
            }
        }
    }

    /**
     * @ignore
     */
    onKeydown(event: KeyboardEvent) {
        if (!this.keyManager.activeItem) {
            this.keyManager.setFirstItemActive();
        }

        if (event.key === TAB && event.shiftKey) {
            if (this.keyManager.activeItemIndex === 0) return;
            this.keyManager.setPreviousItemActive();
            event.preventDefault();
        } else if (event.key === TAB) {
            const items = this.items();
            if (this.keyManager.activeItemIndex === items.length - 1) {
                return;
            }
            this.keyManager.setNextItemActive();
            event.preventDefault();
        } else {
            this.keyManager.onKeydown(event);
        }
    }
}
