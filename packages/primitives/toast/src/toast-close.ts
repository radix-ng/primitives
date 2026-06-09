import { Directive } from '@angular/core';
import { injectRdxToastRootContext } from './toast-root';

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
    protected readonly rootContext = injectRdxToastRootContext()!;
}
