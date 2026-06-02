import { _IdGenerator } from '@angular/cdk/a11y';
import { DestroyRef, Directive, inject } from '@angular/core';
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
    private readonly rootContext = injectRdxPopoverRootContext()!;
    readonly id = inject(_IdGenerator).getId('rdx-popover-title-');

    constructor() {
        this.rootContext.setTitleId(this.id);
        inject(DestroyRef).onDestroy(() => this.rootContext.setTitleId(undefined));
    }
}
