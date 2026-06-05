import { Directive } from '@angular/core';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * An overlay displayed beneath the dialog popup.
 */
@Directive({
    selector: '[rdxDialogBackdrop]',
    exportAs: 'rdxDialogBackdrop',
    host: {
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"'
    }
})
export class RdxDialogBackdrop {
    protected readonly rootContext = injectRdxDialogRootContext()!;
}
