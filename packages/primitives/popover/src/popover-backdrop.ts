import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { RDX_FLOATING_ROOT_CONTEXT } from '@radix-ng/primitives/core';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * An optional backdrop rendered behind the popup.
 */
@Directive({
    selector: '[rdxPopoverBackdrop]',
    host: {
        role: 'presentation',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[style.pointer-events]': 'rootContext.openChangeReason() === "trigger-hover" ? "none" : null',
        '[style.user-select]': '"none"'
    }
})
export class RdxPopoverBackdrop {
    protected readonly rootContext = injectRdxPopoverRootContext();

    constructor() {
        const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        host.style.setProperty('-webkit-user-select', 'none');

        // Register the backdrop as owned DOM footprint for primitive-specific checks. The focus manager's
        // marker keep-set stays narrow and does not keep sibling backdrop roots.
        const floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT, { optional: true });
        if (floatingContext) {
            floatingContext.addFloatingElement(host);
            inject(DestroyRef).onDestroy(() => floatingContext.removeFloatingElement(host));
        }
    }
}
