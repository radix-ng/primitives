import { computed, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';
import {
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration
} from '@radix-ng/primitives/core';
import { RdxDismiss } from '@radix-ng/primitives/dismissable-layer';
import { RdxPopperContent, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectRdxPreviewCardRootContext, RdxPreviewCardOpenChangeReason } from './preview-card-root';

/**
 * A container for the preview-card contents.
 *
 * **ADR 0015 migration** onto the new floating dismissal engine (dismissal-only — a preview-card has
 * no focus manager, ADR 0017 §1). Escape, an outside press, and a focus-out all close it (the legacy's
 * trigger-press preventDefault is now automatic: the trigger is the registered reference, so a press on
 * it is "inside" and never fires `pointerDownOutside`). A focus-out while a pointer is held on the
 * trigger is still vetoed.
 */
@Directive({
    selector: '[rdxPreviewCardPopup]',
    hostDirectives: [RdxPopperContent, RdxFloatingNodeRegistration],
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
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });
    protected readonly align = computed(() => this.wrapper?.placedAlign());
    protected readonly side = computed(() => this.wrapper?.placedSide());

    /**
     * Event handler called when the escape key is down. Can be prevented.
     */
    readonly escapeKeyDown = output<KeyboardEvent>();

    /**
     * Event handler called when a pointerdown event happens outside of the popup. Can be prevented.
     */
    readonly pointerDownOutside = output<PointerEvent>();

    /**
     * Event handler called when focus moves outside of the popup. Can be prevented.
     */
    readonly focusOutside = output<FocusEvent>();

    /**
     * Event handler called when an interaction happens outside of the popup. Can be prevented.
     */
    readonly interactOutside = output<PointerEvent | FocusEvent>();

    constructor() {
        this.floatingContext.setFloatingElement(this.host);

        const unregisterTransitionElement = this.rootContext.registerTransitionElement(this.host);
        inject(DestroyRef).onDestroy(unregisterTransitionElement);

        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => true,
            outsidePress: () => true,
            focusOutside: () => true,
            onEscapeKeyDown: (event) => this.escapeKeyDown.emit(event),
            onPointerDownOutside: (event) => {
                this.pointerDownOutside.emit(event);
                this.interactOutside.emit(event);
            },
            onFocusOutside: (event) => {
                // A focus-out triggered by a pointer press still in flight on the trigger must not close
                // the card (the toggle handles it) — veto it like the legacy did.
                if (this.rootContext.isPointerDownOnTrigger()) {
                    event.preventDefault();
                }
                this.focusOutside.emit(event);
                this.interactOutside.emit(event);
            },
            onDismiss: (reason, event) => {
                const mapped: RdxPreviewCardOpenChangeReason =
                    reason === 'escape-key' ? 'escape-key' : reason === 'outside-press' ? 'outside-press' : 'none';
                this.rootContext.close(mapped, event);
            }
        });
    }
}
