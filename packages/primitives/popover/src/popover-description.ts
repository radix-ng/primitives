import { _IdGenerator } from '@angular/cdk/a11y';
import { DestroyRef, Directive, inject } from '@angular/core';
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
    readonly id = inject(_IdGenerator).getId('rdx-popover-description-');

    constructor() {
        this.rootContext.setDescriptionId(this.id);
        inject(DestroyRef).onDestroy(() => this.rootContext.setDescriptionId(undefined));
    }
}
