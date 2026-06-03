import { injectRdxToastRootContext } from './toast-root';
import { Directive } from '@angular/core';

/** Button that dismisses its toast. Put it on a native `<button>` for built-in semantics. */
@Directive({
    selector: '[rdxToastClose]',
    exportAs: 'rdxToastClose',
    host: {
        type: 'button',
        '(click)': 'rootContext.close()'
    }
})
export class RdxToastClose {
    protected readonly rootContext = injectRdxToastRootContext();
}
