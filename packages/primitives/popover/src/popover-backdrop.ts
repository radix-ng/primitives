import { Directive } from '@angular/core';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * An optional backdrop rendered behind the popup.
 */
@Directive({
    selector: '[rdxPopoverBackdrop]',
    host: {
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"'
    }
})
export class RdxPopoverBackdrop {
    protected readonly rootContext = injectRdxPopoverRootContext();
}
