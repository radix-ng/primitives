import { computed, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { useScrollLock } from '@radix-ng/primitives/core';
import { provideRdxDismissableLayerConfig, RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { provideRdxFocusScopeConfig, RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { injectRdxDialogRootContext, RdxDialogOpenChangeReason } from './dialog-root';

/**
 * A container for the dialog contents.
 */
@Directive({
    selector: '[rdxDialogPopup]',
    exportAs: 'rdxDialogPopup',
    hostDirectives: [RdxDismissableLayer, RdxFocusScope],
    providers: [
        provideRdxDismissableLayerConfig(() => {
            const rootContext = injectRdxDialogRootContext()!;

            return {
                disableOutsidePointerEvents: computed(() => rootContext.modal() === true)
            };
        }),
        provideRdxFocusScopeConfig(() => {
            const rootContext = injectRdxDialogRootContext()!;

            return {
                trapped: computed(() => rootContext.modal() === 'trap-focus' || rootContext.modal() === true)
            };
        })
    ],
    host: {
        '[attr.role]': 'rootContext.role',
        '[attr.aria-modal]': 'rootContext.modal() === true ? "true" : undefined',
        '[attr.aria-describedby]': 'rootContext.descriptionId()',
        '[attr.aria-labelledby]': 'rootContext.titleId()',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-nested]': 'rootContext.nested ? "" : undefined',
        '[attr.data-nested-dialog-open]': 'rootContext.nestedDialogOpen() ? "" : undefined',
        '[id]': 'rootContext.contentId'
    }
})
export class RdxDialogPopup {
    protected readonly rootContext = injectRdxDialogRootContext()!;
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly focusScope = inject(RdxFocusScope);
    private dismissDetails: { reason: RdxDialogOpenChangeReason; event: Event } = {
        reason: 'none',
        event: new Event('dialog.dismiss')
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

    /**
     * Event handler called before focus moves into the popup. Can be prevented.
     */
    readonly openAutoFocus = outputFromObservable(outputToObservable(this.focusScope.mountAutoFocus));

    /**
     * Event handler called before focus returns after the popup is removed. Can be prevented.
     */
    readonly closeAutoFocus = outputFromObservable(outputToObservable(this.focusScope.unmountAutoFocus));

    constructor() {
        useScrollLock(computed(() => this.rootContext.modal() === true && this.rootContext.isOpen()));

        const unregisterTransitionElement = this.rootContext.registerTransitionElement(
            inject<ElementRef<HTMLElement>>(ElementRef).nativeElement
        );

        inject(DestroyRef).onDestroy(unregisterTransitionElement);

        this.dismissableLayer.pointerDownOutside.subscribe((event) => {
            this.dismissDetails = { reason: 'outside-press', event };

            // A pointerdown on the trigger is an "outside" press relative to the portaled popup.
            // Let the trigger's own click toggle the dialog instead of dismissing here (which would
            // close and then immediately reopen).
            if (this.isEventOnTrigger(event)) {
                event.preventDefault();
            }
        });

        this.dismissableLayer.focusOutside.subscribe((event) => {
            this.dismissDetails = { reason: 'focus-out', event };

            if (this.isEventOnTrigger(event)) {
                event.preventDefault();
            }
        });

        this.dismissableLayer.escapeKeyDown.subscribe((event) => {
            this.dismissDetails = { reason: 'escape-key', event };
        });

        this.dismissableLayer.dismiss.subscribe(() => {
            const { reason, event } = this.dismissDetails;
            this.dismissDetails = { reason: 'none', event: new Event('dialog.dismiss') };

            // When pointer dismissal is disabled, keep the dialog open on outside interactions.
            // Escape always closes (standard a11y behavior).
            if ((reason === 'outside-press' || reason === 'focus-out') && this.rootContext.disablePointerDismissal()) {
                return;
            }

            this.rootContext.close(reason, event);
        });
    }

    private isEventOnTrigger(event: Event): boolean {
        const target = event.target as Node | null;
        return !!target && this.rootContext.triggers().some((trigger) => trigger.contains(target));
    }
}
