import { Directive } from '@angular/core';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * An optional backdrop rendered behind the popup.
 */
@Directive({
    selector: '[rdxNavigationMenuBackdrop]',
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"'
    }
})
export class RdxNavigationMenuBackdrop {
    protected readonly rootContext = injectNavigationMenuRootContext()!;
}
