import { Directive } from '@angular/core';
import { injectRdxToastRootContext } from './toast-root';

/**
 * An action button inside a toast (e.g. "Undo"). Unlike {@link RdxToastClose} it does not dismiss
 * on its own — wire your handler with `(click)` and call `close()` from the exposed context when
 * the action should also close the toast.
 */
@Directive({
    selector: '[rdxToastAction]',
    exportAs: 'rdxToastAction',
    host: {
        type: 'button'
    }
})
export class RdxToastAction {
    /** The toast root context, so handlers can read the toast or dismiss it after acting. */
    readonly rootContext = injectRdxToastRootContext()!;
}
