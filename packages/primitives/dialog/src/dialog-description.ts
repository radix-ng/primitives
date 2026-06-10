import { DestroyRef, Directive, inject } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * An accessible description for the dialog.
 */
@Directive({
    selector: '[rdxDialogDescription]',
    exportAs: 'rdxDialogDescription',
    host: {
        '[id]': 'id'
    }
})
export class RdxDialogDescription {
    private readonly rootContext = injectRdxDialogRootContext();
    readonly id = injectId('rdx-dialog-description-');

    constructor() {
        this.rootContext.setDescriptionId(this.id);
        inject(DestroyRef).onDestroy(() => this.rootContext.setDescriptionId(undefined));
    }
}
