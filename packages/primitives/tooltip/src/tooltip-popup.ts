import { computed, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
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
        '[id]': 'rootContext.contentId()',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instantType()',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()'
    }
})
export class RdxTooltipPopup {
    protected readonly rootContext = injectRdxTooltipContext();
    /** @internal Target for measuring the viewport's live content. */
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });

    constructor() {
        const unregisterId = this.rootContext.registerContentId(injectId('rdx-tooltip-content-'));
        const unregister = this.rootContext.renderLifecycle.registerElement(this.element);
        inject(DestroyRef).onDestroy(() => {
            unregisterId();
            unregister();
        });
    }

    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());
}
