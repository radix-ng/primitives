import { Directive, ElementRef, inject } from '@angular/core';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * An optional backdrop rendered behind the popup.
 */
@Directive({
    selector: '[rdxNavigationMenuBackdrop]',
    host: {
        role: 'presentation',
        '[attr.hidden]': 'rootContext.present() ? undefined : ""',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[style.user-select]': '"none"'
    }
})
export class RdxNavigationMenuBackdrop {
    protected readonly rootContext = injectNavigationMenuRootContext();

    constructor() {
        const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        host.style.setProperty('-webkit-user-select', 'none');
        host.style.webkitUserSelect = 'none';
    }
}
