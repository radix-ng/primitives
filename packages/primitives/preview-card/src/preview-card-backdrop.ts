import { Directive } from '@angular/core';
import { injectRdxPreviewCardRootContext } from './preview-card-root';

/**
 * An optional backdrop rendered behind the popup.
 */
@Directive({
    selector: '[rdxPreviewCardBackdrop]',
    host: {
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instantType()',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined'
    }
})
export class RdxPreviewCardBackdrop {
    protected readonly rootContext = injectRdxPreviewCardRootContext();
}
