import { DestroyRef, Directive, inject } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * An accessible description for the popover.
 */
@Directive({
    selector: '[rdxPopoverDescription]',
    host: {
        '[id]': 'id'
    }
})
export class RdxPopoverDescription {
    private readonly rootContext = injectRdxPopoverRootContext()!;
    readonly id = injectId('rdx-popover-description-');

    constructor() {
        this.rootContext.setDescriptionId(this.id);
        inject(DestroyRef).onDestroy(() => this.rootContext.setDescriptionId(undefined));
    }
}
