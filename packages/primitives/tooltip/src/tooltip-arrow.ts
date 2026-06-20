import { computed, Directive, inject } from '@angular/core';
import { RdxPopperArrow, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { RdxVisuallyHiddenDirective } from '@radix-ng/primitives/visually-hidden';
import { injectRdxTooltipContext } from './tooltip';

@Directive({
    selector: '[rdxTooltipArrow]',
    hostDirectives: [RdxPopperArrow],
    host: {
        '[hidden]': 'isVisuallyHidden',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-instant]': 'rootContext.instantType()',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()',
        '[attr.data-uncentered]': 'uncentered() ? "" : undefined'
    }
})
export class RdxTooltipArrow {
    protected readonly rootContext = injectRdxTooltipContext();
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });

    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());
    protected readonly uncentered = computed(() => this.wrapper?.arrowUncentered() ?? false);

    protected readonly isVisuallyHidden = !!inject(RdxVisuallyHiddenDirective, {
        optional: true
    });
}
