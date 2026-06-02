import { Directive, inject } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { RdxPopperContent } from '@radix-ng/primitives/popper';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * A container for the popover contents.
 */
@Directive({
    selector: '[rdxPopoverPopup]',
    hostDirectives: [RdxPopperContent, RdxDismissableLayer, RdxFocusScope],
    host: {
        role: 'dialog',
        '[attr.aria-describedby]': 'rootContext.descriptionId()',
        '[attr.aria-labelledby]': 'rootContext.titleId()',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[id]': 'rootContext.contentId'
    }
})
export class RdxPopoverPopup {
    protected readonly rootContext = injectRdxPopoverRootContext()!;
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly focusScope = inject(RdxFocusScope);

    /**
     * Event handler called when the escape key is down. Can be prevented.
     */
    readonly escapeKeyDown = outputFromObservable(outputToObservable(this.dismissableLayer.escapeKeyDown));

    /**
     * Event handler called when a pointerdown event happens outside of the popup. Can be prevented.
     */
    readonly pointerDownOutside = outputFromObservable(outputToObservable(this.dismissableLayer.pointerDownOutside));

    /**
     * Event handler called when focus moves outside of the popup. Can be prevented.
     */
    readonly focusOutside = outputFromObservable(outputToObservable(this.dismissableLayer.focusOutside));

    /**
     * Event handler called when an interaction happens outside of the popup. Can be prevented.
     */
    readonly interactOutside = outputFromObservable(outputToObservable(this.dismissableLayer.interactOutside));

    /**
     * Event handler called before focus moves into the popup. Can be prevented.
     */
    readonly openAutoFocus = outputFromObservable(outputToObservable(this.focusScope.mountAutoFocus));

    /**
     * Event handler called before focus returns after the popup is removed. Can be prevented.
     */
    readonly closeAutoFocus = outputFromObservable(outputToObservable(this.focusScope.unmountAutoFocus));

    constructor() {
        this.dismissableLayer.pointerDownOutside.subscribe((event) => {
            if (this.rootContext.trigger()?.contains(event.target as Node)) {
                event.preventDefault();
            }
        });

        this.dismissableLayer.focusOutside.subscribe((event) => {
            if (this.rootContext.isPointerDownOnTrigger()) {
                event.preventDefault();
            }
        });

        this.dismissableLayer.dismiss.subscribe(() => this.rootContext.close());
    }
}
