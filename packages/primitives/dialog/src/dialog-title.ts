import { _IdGenerator } from '@angular/cdk/a11y';
import { DestroyRef, Directive, inject } from '@angular/core';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * An accessible title for the dialog.
 */
@Directive({
    selector: '[rdxDialogTitle]',
    exportAs: 'rdxDialogTitle',
    host: {
        '[id]': 'id'
    }
})
export class RdxDialogTitle {
    private readonly rootContext = injectRdxDialogRootContext()!;
    readonly id = inject(_IdGenerator).getId('rdx-dialog-title-');

    constructor() {
        this.rootContext.setTitleId(this.id);
        inject(DestroyRef).onDestroy(() => this.rootContext.setTitleId(undefined));
    }
}
