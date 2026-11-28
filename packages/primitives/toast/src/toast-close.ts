import { Directive } from '@angular/core';
import { injectRdxToastRootContext } from './toast-root';

/** Button that dismisses its toast. Put it on a native `<button>` for built-in semantics. */
@Directive({
    selector: '[rdxToastClose]',
    exportAs: 'rdxToastClose',
    host: {
        type: 'button',
        // WebKit can skip buttons without an explicit tab stop.
        tabindex: '0',
        '[attr.data-type]': 'rootContext.toast().type',
        '(click)': 'rootContext.close()'
    }
})
export class RdxToastClose {
    protected readonly rootContext = injectRdxToastRootContext();
}
