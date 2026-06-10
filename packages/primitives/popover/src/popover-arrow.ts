import { computed, Directive, inject } from '@angular/core';
import { RdxPopperArrow, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * An optional arrow element rendered alongside the popover.
 */
@Directive({
    selector: '[rdxPopoverArrow]',
    hostDirectives: [RdxPopperArrow],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()',
        '[attr.data-uncentered]': 'uncentered() ? "" : undefined'
    }
})
export class RdxPopoverArrow {
    protected readonly rootContext = injectRdxPopoverRootContext();
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });

    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());
    protected readonly uncentered = computed(() => this.wrapper?.arrowUncentered() ?? false);
}
