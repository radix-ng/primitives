import { Directive } from '@angular/core';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * A positioning container for the dialog popup that can be made scrollable.
 *
 * Place it inside the portal, around the popup, to scroll the popup when it is taller than the
 * viewport (outside scroll). Pointer events pass through while the dialog is closed.
 */
@Directive({
    selector: '[rdxDialogViewport]',
    exportAs: 'rdxDialogViewport',
    host: {
        role: 'presentation',
        '[style.pointer-events]': 'rootContext.isOpen() ? null : "none"',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-nested]': 'rootContext.nested() ? "" : undefined',
        '[attr.data-nested-dialog-open]': 'rootContext.nestedDialogOpen() ? "" : undefined'
    }
})
export class RdxDialogViewport {
    protected readonly rootContext = injectRdxDialogRootContext()!;
}
