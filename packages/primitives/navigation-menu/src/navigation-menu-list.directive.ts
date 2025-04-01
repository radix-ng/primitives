import { AfterViewInit, Directive, ElementRef, inject, Renderer2 } from '@angular/core';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuList]',
    standalone: true,
    host: {
        '[attr.data-orientation]': 'context.orientation',
        role: 'menubar'
    }
})
export class RdxNavigationMenuListDirective implements AfterViewInit {
    private readonly context = injectNavigationMenu();
    private readonly elementRef = inject(ElementRef);
    private readonly renderer = inject(Renderer2);

    ngAfterViewInit() {
        if (isRootNavigationMenu(this.context) && this.context.onIndicatorTrackChange) {
            // create a wrapper with relative positioning for indicator track
            const wrapper = this.renderer.createElement('div');
            this.renderer.setStyle(wrapper, 'position', 'relative');

            // get parent and current element
            const parent = this.elementRef.nativeElement.parentNode;
            const element = this.elementRef.nativeElement;

            // The indicator needs to be positioned absolutely relative to its containing
            // block (the list), but we don't want the indicator itself to affect the
            // layout of the list items. Creating a relative wrapper allows the indicator
            // to be positioned correctly within the wrapper without interfering with the
            // list items' flow.
            this.renderer.insertBefore(parent, wrapper, element);
            this.renderer.removeChild(parent, element);
            this.renderer.appendChild(wrapper, element);

            // register the wrapper as the indicator track
            this.context.onIndicatorTrackChange(wrapper);
        }
    }
}
