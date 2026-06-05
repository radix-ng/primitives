import { _IdGenerator } from '@angular/cdk/a11y';
import { DestroyRef, Directive, inject } from '@angular/core';
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
    private readonly rootContext = injectRdxDialogRootContext()!;
    readonly id = inject(_IdGenerator).getId('rdx-dialog-description-');

    constructor() {
        this.rootContext.setDescriptionId(this.id);
        inject(DestroyRef).onDestroy(() => this.rootContext.setDescriptionId(undefined));
    }
}
