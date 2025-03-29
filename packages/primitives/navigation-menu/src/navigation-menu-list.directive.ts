import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';
import { injectNavigationMenu } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuList]',
    standalone: true,
    host: {
        '[attr.data-orientation]': 'context.orientation'
    }
})
export class RdxNavigationMenuListDirective implements AfterViewInit {
    protected readonly context = injectNavigationMenu();
    private readonly elementRef = inject(ElementRef);

    ngAfterViewInit() {
        // If this is the root menu, set up the indicator track
        if ('indicatorTrack' in this.context) {
            const trackWrapper = document.createElement('div');
            trackWrapper.style.position = 'relative';

            // Move list into the wrapper
            const parent = this.elementRef.nativeElement.parentNode;
            parent.insertBefore(trackWrapper, this.elementRef.nativeElement);
            trackWrapper.appendChild(this.elementRef.nativeElement);

            // Set the indicator track
            (this.context as any).indicatorTrack.set(trackWrapper);
        }
    }
}
