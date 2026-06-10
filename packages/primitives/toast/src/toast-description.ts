import { DestroyRef, Directive, inject } from '@angular/core';
import { injectRdxToastRootContext } from './toast-root';

/** Supporting body text for a toast; registers so `aria-describedby` only targets a real node. */
@Directive({
    selector: '[rdxToastDescription]',
    exportAs: 'rdxToastDescription',
    host: {
        '[id]': 'rootContext.descriptionId'
    }
})
export class RdxToastDescription {
    protected readonly rootContext = injectRdxToastRootContext();

    constructor() {
        this.rootContext.setDescriptionPresent(true);
        inject(DestroyRef).onDestroy(() => this.rootContext.setDescriptionPresent(false));
    }
}
