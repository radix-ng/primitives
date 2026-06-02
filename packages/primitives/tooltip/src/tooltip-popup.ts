import { computed, Directive, inject } from '@angular/core';
import { RdxPopperContent, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectRdxTooltipContext } from './tooltip';

/**
 * The tooltip popup. Renders the content with `role="tooltip"`.
 */
@Directive({
    selector: '[rdxTooltipPopup]',
    hostDirectives: [RdxPopperContent],
    host: {
        role: 'tooltip',
        '[id]': 'rootContext.contentId',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()'
    }
})
export class RdxTooltipPopup {
    protected readonly rootContext = injectRdxTooltipContext()!;
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });

    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());
}
