import { Directive, effect, ElementRef, inject, Renderer2, untracked } from '@angular/core';
import { injectPopoverRoot } from './popover-root.inject';

@Directive({
    selector: '[rdxPopoverClose]',
    standalone: true,
    host: {
        type: 'button',
        '(click)': 'popoverRoot.handleClose()'
    }
})
export class RdxPopoverCloseDirective {
    /** @ignore */
    readonly popoverRoot = injectPopoverRoot();
    /** @ignore */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);
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
