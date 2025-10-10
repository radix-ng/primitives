import { computed, Directive } from '@angular/core';
import { injectPopperContentWrapperContext } from './popper-content-wrapper';

@Directive({
    selector: '[rdxPopperContent]',
    host: {
        '[attr.data-side]': 'popperPanel.placedSide()',
        '[attr.data-align]': 'popperPanel.placedAlign()',
        '[style]': 'style()'
    }
})
export class RdxPopperContent {
    protected readonly popperPanel = injectPopperContentWrapperContext()!;

    /**
     * if the PopperContent hasn't been placed yet (not all measurements done)
     * we prevent animations so that users's animation don't kick in too early referring wrong sides
     */
    protected readonly style = computed(() => ({
        animation: !this.popperPanel.isPositioned() ? 'none' : ''
    }));
}
