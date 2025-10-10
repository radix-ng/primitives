import { computed, Directive } from '@angular/core';
import { injectPopperContentWrapperContext } from './popper-content-wrapper';

@Directive({
    selector: '[rdxPopperContent]',
    host: {
        '[attr.data-side]': 'popperContentWrapper.placedSide()',
        '[attr.data-align]': 'popperContentWrapper.placedAlign()',
        '[style]': 'style()'
    }
})
export class RdxPopperContent {
    protected readonly popperContentWrapper = injectPopperContentWrapperContext()!;

    /**
     * if the PopperContent hasn't been placed yet (not all measurements done)
     * we prevent animations so that users's animation don't kick in too early referring wrong sides
     */
    protected readonly style = computed(() => ({
        animation: !this.popperContentWrapper.isPositioned() ? 'none' : undefined
    }));
}
