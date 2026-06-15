import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { RDX_FLOATING_ROOT_CONTEXT } from '@radix-ng/primitives/core';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * An optional backdrop rendered behind the popup.
 */
@Directive({
    selector: '[rdxPopoverBackdrop]',
    host: {
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"'
    }
})
export class RdxPopoverBackdrop {
    protected readonly rootContext = injectRdxPopoverRootContext();

    constructor() {
        // Register the backdrop (a separate portal root) as an owned floating element so the focus
        // manager's markOthers keeps it instead of aria-hiding / marking it (ADR 0017 §3).
        const floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT, { optional: true });
        if (floatingContext) {
            const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
            floatingContext.addFloatingElement(host);
            inject(DestroyRef).onDestroy(() => floatingContext.removeFloatingElement(host));
        }
    }
}
