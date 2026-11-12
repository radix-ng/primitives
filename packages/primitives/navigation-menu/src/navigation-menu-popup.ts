import { computed, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';
import { RDX_FLOATING_REGISTRATION, RDX_FLOATING_ROOT_CONTEXT } from '@radix-ng/primitives/core';
import { RdxDismiss, RdxOutsidePressDomEvent } from '@radix-ng/primitives/dismissable-layer';
import { RdxPopperContent, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { handleNavigationMenuKeydown } from './navigation-menu-keyboard';
import { injectNavigationMenuRootContext, RdxNavigationMenuOpenChangeReason } from './navigation-menu-root-context';

/**
 * The shared container for the active item's content.
 */
@Directive({
    selector: '[rdxNavigationMenuPopup]',
    hostDirectives: [RdxPopperContent],
    host: {
        tabindex: '-1',
        '[id]': 'id()',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()',
        '[style.--popup-width.px]': 'rootContext.size()?.width',
        '[style.--popup-height.px]': 'rootContext.size()?.height',
        '(pointerenter)': 'rootContext.cancelHoverClose()',
        '(pointerleave)': 'onPointerLeave($event)',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxNavigationMenuPopup {
    protected readonly rootContext = injectNavigationMenuRootContext();
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());

    protected readonly id = computed(() => {
        const value = this.rootContext.value() ?? this.rootContext.previousValue();
        return value ? `${this.rootContext.baseId}-popup-${value}` : `${this.rootContext.baseId}-popup`;
    });

    /**
     * Event handler called when the escape key is down. Can be prevented.
     */
    readonly escapeKeyDown = output<KeyboardEvent>();

    /**
     * Event handler called when a pointerdown event happens outside the popup. Can be prevented.
     */
    readonly pointerDownOutside = output<RdxOutsidePressDomEvent>();

    /**
     * Event handler called when focus moves outside the popup. Can be prevented.
     */
    readonly focusOutside = output<FocusEvent>();

    constructor() {
        const destroyRef = inject(DestroyRef);
        const unregisterTransitionElement = this.rootContext.registerTransitionElement(this.elementRef.nativeElement);
        const unregisterPopup = this.rootContext.registerPopup(this.elementRef.nativeElement);

        destroyRef.onDestroy(unregisterTransitionElement);
        destroyRef.onDestroy(unregisterPopup);

        // The popup is this layer's floating element (the inside surface for containment checks). The
        // triggers are registered as "inside" on the shared root context (in `registerTrigger`), so a
        // press / focus on a sibling trigger to switch items — or back on the active trigger — never
        // counts as an outside dismissal. This replaces the legacy dismissable-layer `branches` registry.
        this.floatingContext.setFloatingElement(this.elementRef.nativeElement);

        // Dismissal (ADR 0015): Escape, an outside press, or focus moving outside closes the menu.
        // Navigation Menu registers its FloatingNode on the root, matching Base UI's
        // NavigationMenuRoot → FloatingNode wiring. This lets nested roots participate in parent/child
        // ownership even though each root has one shared popup.
        // It does not trap focus, so it closes on focus-out like a non-modal menu.
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => true,
            outsidePress: () => true,
            outsidePressEvent: () => 'intentional',
            focusOutside: () => true,
            onEscapeKeyDown: (event) => this.escapeKeyDown.emit(event),
            onPointerDownOutside: (event) => this.pointerDownOutside.emit(event),
            onFocusOutside: (event) => this.focusOutside.emit(event),
            onDismiss: (reason, event) => {
                const navReason: RdxNavigationMenuOpenChangeReason =
                    reason === 'escape-key' ? 'escape-key' : reason === 'focus-outside' ? 'focus-out' : 'outside-press';
                this.rootContext.close(navReason, event);

                // Return focus to the trigger after an Escape dismissal.
                if (reason === 'escape-key') {
                    this.rootContext.trigger()?.focus();
                }
            }
        });
    }

    protected onPointerLeave(event: PointerEvent) {
        if (event.pointerType === 'touch') {
            return;
        }

        this.rootContext.closeOnHover(event);
    }

    protected onKeydown(event: KeyboardEvent): void {
        // Viewports own panel keys, including nested inline content. Only a key on the popup
        // surface itself needs this fallback; native Tab inside content must not run twice.
        if ((event.target as HTMLElement).closest('[rdxNavigationMenuViewport]')) return;
        handleNavigationMenuKeydown(event, this.elementRef.nativeElement, this.rootContext);
    }
}
