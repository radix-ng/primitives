import { computed, DestroyRef, Directive, ElementRef, inject, signal } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { provideRdxDismissableLayerConfig, RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { RdxPopperContent, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectRdxPreviewCardRootContext, RdxPreviewCardOpenChangeReason } from './preview-card-root';

/**
 * A container for the preview-card contents.
 */
@Directive({
    selector: '[rdxPreviewCardPopup]',
    hostDirectives: [RdxPopperContent, RdxDismissableLayer],
    providers: [
        provideRdxDismissableLayerConfig(() => {
            return {
                disableOutsidePointerEvents: signal(false)
            };
        })
    ],
    host: {
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-align]': 'align()',
        '[attr.data-side]': 'side()',
        '[id]': 'rootContext.contentId',
        '(pointerenter)': 'rootContext.cancelHoverClose()'
    }
})
export class RdxPreviewCardPopup {
    protected readonly rootContext = injectRdxPreviewCardRootContext();
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });
    protected readonly align = computed(() => this.wrapper?.placedAlign());
    protected readonly side = computed(() => this.wrapper?.placedSide());
    private dismissDetails: { reason: RdxPreviewCardOpenChangeReason; event: Event } = {
        reason: 'none',
        event: new Event('preview-card.dismiss')
    };

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

    constructor() {
        const unregisterTransitionElement = this.rootContext.registerTransitionElement(
            inject<ElementRef<HTMLElement>>(ElementRef).nativeElement
        );

        inject(DestroyRef).onDestroy(() => {
            unregisterTransitionElement();
        });

        this.dismissableLayer.pointerDownOutside.subscribe((event) => {
            this.dismissDetails = { reason: 'outside-press', event };

            if (this.rootContext.triggers().some((trigger) => trigger.contains(event.target as Node))) {
                event.preventDefault();
            }
        });

        this.dismissableLayer.focusOutside.subscribe((event) => {
            this.dismissDetails = { reason: 'none', event };

            if (this.rootContext.isPointerDownOnTrigger()) {
                event.preventDefault();
            }
        });

        this.dismissableLayer.escapeKeyDown.subscribe((event) => {
            this.dismissDetails = { reason: 'escape-key', event };
        });

        this.dismissableLayer.dismiss.subscribe(() => {
            this.rootContext.close(this.dismissDetails.reason, this.dismissDetails.event);
            this.dismissDetails = { reason: 'none', event: new Event('preview-card.dismiss') };
        });
    }
}
