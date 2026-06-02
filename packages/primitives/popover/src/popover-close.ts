import { DestroyRef, Directive, inject } from '@angular/core';
import { RdxPopoverPopup } from './popover-popup';
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

    constructor() {
        if (inject(RdxPopoverPopup, { optional: true })) {
            const unregister = this.rootContext.registerPopupClose();
            inject(DestroyRef).onDestroy(unregister);
        }
    }
}
