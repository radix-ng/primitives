import { Directive, effect, ElementRef, forwardRef, inject, Renderer2, untracked } from '@angular/core';
import { RdxPopoverCloseToken } from './tooltip-close.token';
import { injectPopoverRoot } from './tooltip-root.inject';

@Directive({
    selector: '[rdxPopoverClose]',
    host: {
        type: 'button',
        '(click)': 'popoverRoot.handleClose()'
    },
    providers: [
        {
            provide: RdxPopoverCloseToken,
            useExisting: forwardRef(() => RdxPopoverCloseDirective)
        }
    ]
})
export class RdxPopoverCloseDirective {
    /** @ignore */
    protected readonly popoverRoot = injectPopoverRoot();
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
            const isControlledExternally = this.popoverRoot.controlledExternally()();

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
