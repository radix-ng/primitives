import { DestroyRef, Directive, inject } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * An accessible title for the popover.
 */
@Directive({
    selector: '[rdxPopoverTitle]',
    host: {
        '[id]': 'id'
    }
})
export class RdxPopoverTitle {
    private readonly rootContext = injectRdxPopoverRootContext();
    readonly id = injectId('rdx-popover-title-');

    constructor() {
        this.rootContext.setTitleId(this.id);
        inject(DestroyRef).onDestroy(() => this.rootContext.setTitleId(undefined));
    }
}
