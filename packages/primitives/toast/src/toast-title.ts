import { DestroyRef, Directive, inject } from '@angular/core';
import { injectRdxToastRootContext } from './toast-root';

/** Accessible title for a toast; registers so the root only points `aria-labelledby` at a real node. */
@Directive({
    selector: '[rdxToastTitle]',
    exportAs: 'rdxToastTitle',
    host: {
        '[id]': 'rootContext.titleId'
    }
})
export class RdxToastTitle {
    protected readonly rootContext = injectRdxToastRootContext();

    constructor() {
        this.rootContext.setTitlePresent(true);
        inject(DestroyRef).onDestroy(() => this.rootContext.setTitlePresent(false));
    }
}
