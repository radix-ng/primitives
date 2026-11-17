import { computed, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
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
        '[attr.data-instant]': 'rootContext.instantType()',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()'
    }
})
export class RdxTooltipPopup {
    protected readonly rootContext = injectRdxTooltipContext();
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });

    constructor() {
        const unregister = this.rootContext.renderLifecycle.registerElement(
            inject<ElementRef<HTMLElement>>(ElementRef).nativeElement
        );
        inject(DestroyRef).onDestroy(unregister);
    }

    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());
}
