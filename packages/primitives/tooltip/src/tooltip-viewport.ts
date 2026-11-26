import { DestroyRef, Directive, inject } from '@angular/core';
import { usePopupViewport } from '@radix-ng/primitives/core';
import { injectRdxTooltipContext } from './tooltip';
import { RdxTooltipPopup } from './tooltip-popup';
import { RdxTooltipPositioner } from './tooltip-positioner';

/** Animates content between active triggers. Render one direct content wrapper inside the viewport. */
@Directive({
    selector: '[rdxTooltipViewport]',
    host: {
        '[attr.data-activation-direction]': 'viewport.activationDirection()',
        '[attr.data-instant]': 'rootContext.instantType()',
        '[attr.data-transitioning]': 'viewport.transitioning() ? "" : undefined'
    }
})
export class RdxTooltipViewport {
    protected readonly rootContext = injectRdxTooltipContext();
    private readonly popup = inject(RdxTooltipPopup);
    protected readonly viewport = usePopupViewport({
        popup: () => this.popup.element,
        open: this.rootContext.isOpen,
        present: () => this.rootContext.present() || this.rootContext.transitionStatus() === 'ending',
        track: { trigger: this.rootContext.trigger, payload: this.rootContext.payload }
    });

    constructor() {
        const positioner = inject(RdxTooltipPositioner, { optional: true });
        if (positioner) inject(DestroyRef).onDestroy(positioner.registerViewport());
    }
}
