import { AfterViewInit, Directive, ElementRef, inject, Renderer2 } from '@angular/core';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus'; // Import Roving Focus Group
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuList]',
    hostDirectives: [RdxRovingFocusGroupDirective],
    host: {
        role: 'menubar'
    }
})
export class RdxNavigationMenuListDirective implements AfterViewInit {
    private readonly context = injectNavigationMenu();
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly renderer = inject(Renderer2);
    private readonly rovingFocusGroup = inject(RdxRovingFocusGroupDirective, { self: true });

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
}
