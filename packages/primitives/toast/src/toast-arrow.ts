import { computed, Directive, inject } from '@angular/core';
import { RdxPopperArrow, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';

/** Optional decorative arrow for a toast rendered inside a positioner. */
@Directive({
    selector: '[rdxToastArrow]',
    hostDirectives: [RdxPopperArrow],
    host: {
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()'
    }
})
export class RdxToastArrow {
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });
    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());
}
