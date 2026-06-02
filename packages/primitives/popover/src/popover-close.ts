import { Directive } from '@angular/core';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * A button that closes the popover.
 */
@Directive({
    selector: 'button[rdxPopoverClose]',
    host: {
        type: 'button',
        '(click)': 'rootContext.close()'
    }
})
export class RdxPopoverClose {
    protected readonly rootContext = injectRdxPopoverRootContext()!;
}
