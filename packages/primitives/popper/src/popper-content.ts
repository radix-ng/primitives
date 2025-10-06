import { computed, Directive } from '@angular/core';
import { injectPopperContentContext } from './popper-content-wrapper';

@Directive({
    selector: '[rdxPopperContent]',
    host: {
        '[attr.data-side]': 'popperPanel.placedSide()',
        '[attr.data-align]': 'popperPanel.placedAlign()',
        '[style]': 'style()'
    }
})
export class RdxPopperContent {
    protected readonly popperPanel = injectPopperContentContext()!;

    protected readonly style = computed(() => ({
        animation: !this.popperPanel.isPositioned() ? 'none' : ''
    }));
}
