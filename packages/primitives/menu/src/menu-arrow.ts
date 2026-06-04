import { computed, Directive, inject } from '@angular/core';
import { RdxPopperArrow, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectRdxMenuRootContext } from './menu-root';

/**
 * An optional visual arrow connecting the popup to its trigger.
 * Place it inside `rdxMenuPopup`. Positioning is handled by the shared Popper Arrow primitive.
 */
@Directive({
    selector: '[rdxMenuArrow]',
    exportAs: 'rdxMenuArrow',
    hostDirectives: [RdxPopperArrow],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()',
        '[attr.data-uncentered]': 'uncentered() ? "" : undefined'
    }
})
export class RdxMenuArrow {
    protected readonly rootContext = injectRdxMenuRootContext()!;
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });

    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());
    protected readonly uncentered = computed(() => this.wrapper?.arrowUncentered() ?? false);
}
