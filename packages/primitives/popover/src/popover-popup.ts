import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, Directive, effect, inject } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { provideRdxDismissableLayerConfig, RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { provideRdxFocusScopeConfig, RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { RdxPopperContent } from '@radix-ng/primitives/popper';
import { injectRdxPopoverRootContext } from './popover-root';

let originalBodyOverflow: string | null = null;
let scrollLockCount = 0;

/**
 * A container for the popover contents.
 */
@Directive({
    selector: '[rdxPopoverPopup]',
    hostDirectives: [RdxPopperContent, RdxDismissableLayer, RdxFocusScope],
    providers: [
        provideRdxDismissableLayerConfig(() => {
            const rootContext = injectRdxPopoverRootContext()!;

            return {
                disableOutsidePointerEvents: computed(() => rootContext.modal() === true)
            };
        }),
        provideRdxFocusScopeConfig(() => {
            const rootContext = injectRdxPopoverRootContext()!;

            return {
                trapped: computed(
                    () =>
                        rootContext.modal() === 'trap-focus' ||
                        (rootContext.modal() === true && rootContext.hasPopupClose())
                )
            };
        })
    ],
    host: {
        role: 'dialog',
        '[attr.aria-describedby]': 'rootContext.descriptionId()',
        '[attr.aria-labelledby]': 'rootContext.titleId()',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[id]': 'rootContext.contentId',
        '(pointerenter)': 'rootContext.cancelHoverClose()',
        '(pointerleave)': 'rootContext.closeOnHover()'
    }
})
export class RdxPopoverPopup {
    protected readonly rootContext = injectRdxPopoverRootContext()!;
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly document = inject(DOCUMENT);
    private readonly focusScope = inject(RdxFocusScope);
    private isScrollLocked = false;

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
        effect(() => {
            if (this.rootContext.modal() === true) {
                this.lockScroll();
            } else {
                this.unlockScroll();
            }
        });

        inject(DestroyRef).onDestroy(() => this.unlockScroll());

        this.dismissableLayer.pointerDownOutside.subscribe((event) => {
            if (this.rootContext.triggers().some((trigger) => trigger.contains(event.target as Node))) {
                event.preventDefault();
            }
        });

        this.dismissableLayer.focusOutside.subscribe((event) => {
            if (this.rootContext.isPointerDownOnTrigger()) {
                event.preventDefault();
            }
        });

        this.focusScope.mountAutoFocus.subscribe((event) => {
            if (this.rootContext.isHoverActive()) {
                event.preventDefault();
            }
        });

        this.dismissableLayer.dismiss.subscribe(() => this.rootContext.close());
    }

    private lockScroll() {
        if (this.isScrollLocked) {
            return;
        }

        const body = this.document.body;

        if (scrollLockCount === 0) {
            originalBodyOverflow = body.style.overflow;
            body.style.overflow = 'hidden';
        }

        scrollLockCount++;
        this.isScrollLocked = true;
    }

    private unlockScroll() {
        if (!this.isScrollLocked) {
            return;
        }

        scrollLockCount--;
        this.isScrollLocked = false;

        if (scrollLockCount === 0 && originalBodyOverflow !== null) {
            this.document.body.style.overflow = originalBodyOverflow;
            originalBodyOverflow = null;
        }
    }
}
