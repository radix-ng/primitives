import { computed, Directive } from '@angular/core';
import { injectPopperContentWrapperContext } from './popper-content-wrapper';

@Directive({
    selector: '[rdxPopperContent]',
    host: {
        '[attr.data-side]': 'popperContentWrapper?.placedSide()',
        '[attr.data-align]': 'popperContentWrapper?.placedAlign()',
        '[style]': 'style()'
    }
})
export class RdxPopperContent {
    /**
     * Optional so the directive can be composed onto a content part that is also used outside Popper
     * positioning (e.g. select's `item-aligned` mode, where there is no `RdxPopperContentWrapper`
     * ancestor). With no wrapper the `data-side` / `data-align` bindings and the animation guard
     * simply no-op.
     */
    protected readonly popperContentWrapper = injectPopperContentWrapperContext(true);

    /**
     * if the PopperContent hasn't been placed yet (not all measurements done)
     * we prevent animations so that users's animation don't kick in too early referring wrong sides
     */
    protected readonly style = computed(() => ({
        animation: this.popperContentWrapper && !this.popperContentWrapper.isPositioned() ? 'none' : undefined
    }));
}
