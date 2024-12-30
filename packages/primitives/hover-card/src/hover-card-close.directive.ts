import { Directive, effect, ElementRef, forwardRef, inject, Renderer2, untracked } from '@angular/core';
import { RdxHoverCardCloseToken } from './hover-card-close.token';
import { injectHoverCardRoot } from './hover-card-root.inject';

/**
 * TODO: to be removed? But it seems to be useful when controlled from outside
 */
@Directive({
    selector: '[rdxHoverCardClose]',
    host: {
        type: 'button',
        '(click)': 'rootDirective.handleClose(true)'
    },
    providers: [
        {
            provide: RdxHoverCardCloseToken,
            useExisting: forwardRef(() => RdxHoverCardCloseDirective)
        }
    ]
})
export class RdxHoverCardCloseDirective {
    /** @ignore */
    protected readonly rootDirective = injectHoverCardRoot();
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
                    isControlledExternally ? null : 'none'
                );
            });
        });
    }
}
