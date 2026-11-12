import { Directive, inject } from '@angular/core';
import { RDX_FLOATING_ROOT_CONTEXT, usePopupViewport } from '@radix-ng/primitives/core';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * Retains an inert visual snapshot while a popover moves between triggers.
 * Render one direct content wrapper, marked data-current; the outgoing snapshot is data-previous.
 */
@Directive({
    selector: '[rdxPopoverViewport]',
    host: {
        '[attr.data-activation-direction]': 'viewport.activationDirection()',
        '[attr.data-instant]': 'rootContext.instantType()',
        '[attr.data-transitioning]': 'viewport.transitioning() ? "" : undefined'
    }
})
export class RdxPopoverViewport {
    protected readonly rootContext = injectRdxPopoverRootContext();
    private readonly floatingRoot = inject(RDX_FLOATING_ROOT_CONTEXT);
    protected readonly viewport = usePopupViewport({
        popup: () => this.floatingRoot.floatingElement as HTMLElement | undefined,
        open: () => this.rootContext.isOpen(),
        register: (notify) => this.rootContext.registerViewport(notify),
        measure: false
    });
}
