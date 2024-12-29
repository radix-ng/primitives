import { Directive, effect, ElementRef, forwardRef, inject, Renderer2, untracked } from '@angular/core';
import { RdxTooltipCloseToken } from './tooltip-close.token';
import { injectTooltipRoot } from './tooltip-root.inject';

@Directive({
    selector: '[rdxTooltipClose]',
    host: {
        type: 'button',
        '(click)': 'rootDirective.handleClose()'
    },
    providers: [
        {
            provide: RdxTooltipCloseToken,
            useExisting: forwardRef(() => RdxTooltipCloseDirective)
        }
    ]
})
export class RdxTooltipCloseDirective {
    /** @ignore */
    protected readonly rootDirective = injectTooltipRoot();
    /** @ignore */
    readonly elementRef = inject(ElementRef);
    /** @ignore */
    private readonly renderer = inject(Renderer2);

    constructor() {
        this.onIsControlledExternallyEffect();
    }

    /** @ignore */
    private onIsControlledExternallyEffect() {
        effect(() => {
            const isControlledExternally = this.rootDirective.controlledExternally()();

            untracked(() => {
                this.renderer.setStyle(
                    this.elementRef.nativeElement,
                    'display',
                    isControlledExternally ? 'none' : null
                );
            });
        });
    }
}
