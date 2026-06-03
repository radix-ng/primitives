import { getCompositeMenuItems, getDomMenuItems, getFocusableMenuItems, RdxMenuCompositeItem } from './menu-focus';
import { injectRdxMenuRootContext, RdxMenuOpenChangeReason } from './menu-root';
import { computed, DestroyRef, Directive, effect, ElementRef, inject, output } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { RdxCompositeList } from '@radix-ng/primitives/composite';
import {
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    useAnchoredScrollLock
} from '@radix-ng/primitives/core';
import { RdxDismiss, RdxOutsidePressDomEvent } from '@radix-ng/primitives/dismissable-layer';
import {
    provideFloatingFocusManagerConfig,
    RdxFloatingFocusManager
} from '@radix-ng/primitives/floating-focus-manager';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { RdxPopperContent, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';

/**
 * A container for the menu contents.
 */
@Directive({
    selector: '[rdxMenuPopup]',
    exportAs: 'rdxMenuPopup',
    hostDirectives: [RdxPopperContent, RdxFloatingNodeRegistration, RdxFloatingFocusManager, RdxCompositeList],
    providers: [
        provideFloatingFocusManagerConfig(() => {
            const rootContext = injectRdxMenuRootContext();
            const popup = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

            return {
                // Only a (modal) **context menu** traps focus — Base UI's `FloatingFocusManager modal` is
                // true for `context-menu` alone. Other menus stay non-modal and close on focus-out.
                modal: () => rootContext.parentType() === 'context-menu',
                // The manager follows mounted/open lifecycle, not menu disabled state. Dismissal remains
                // disabled separately below; focus/marker policy should not disappear if a menu becomes
                // disabled while open, or if `preventUnmountOnClose()` keeps it mounted after close.
                enabled: () => rootContext.present(),
                restoreFocus: () => true,
                previousFocusableElement: () => rootContext.trigger() ?? null,
                beforeContentFocusGuardRef: () => (element) => rootContext.setBeforeContentFocusGuard(element),
                // Base UI's submenu policy: a submenu mount does not steal focus from its trigger.
                // Root menus still choose first / last item vs popup container from the menu's own
                // open policy (`autoFocus`), but the decision now lives in the focus manager instead
                // of a separate popup effect.
                initialFocus: () => {
                    if (!rootContext.isOpen() || rootContext.parentType() === 'menu') {
                        return false;
                    }

                    const autoFocus = rootContext.autoFocus();

                    if (autoFocus === false) {
                        return false;
                    }

                    if (autoFocus === 'popup') {
                        return popup;
                    }

                    return () => {
                        const items = getFocusableMenuItems(popup);

                        return autoFocus === 'last' ? (items.at(-1) ?? popup) : (items[0] ?? popup);
                    };
                },
                returnFocus: () => {
                    const parentType = rootContext.parentType();

                    if (rootContext.trigger() || parentType === undefined || parentType === 'context-menu') {
                        return true;
                    }

                    if (parentType === 'menubar' && rootContext.lastOpenChangeReason() !== 'outside-press') {
                        return true;
                    }

                    return false;
                },
                openInteractionType: () => rootContext.openInteractionType(),
                closeInteractionType: () => rootContext.closeInteractionType()
            };
        })
    ],
    host: {
        role: 'menu',
        tabindex: '-1',
        '[attr.aria-orientation]': 'rootContext.orientation()',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instantType()',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-align]': 'align()',
        '[attr.data-side]': 'side()',
        '(keydown)': 'handleKeydown($event)',
        '(rdx-menu-close-parent)': 'handleCloseParent($event)'
    }
})
export class RdxMenuPopup {
    protected readonly rootContext = injectRdxMenuRootContext();
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly focusManager = inject(RdxFloatingFocusManager);
    private readonly focusScope = inject(RdxFocusScope);
    private readonly compositeList = inject(RdxCompositeList, { self: true });
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private search = '';
    private searchTimer: ReturnType<typeof setTimeout> | undefined;

    protected readonly align = computed(() => this.wrapper?.placedAlign());
    protected readonly side = computed(() => this.wrapper?.placedSide());

    /**
     * Event handler called when the escape key is pressed. Can be prevented.
     */
    readonly escapeKeyDown = output<KeyboardEvent>();

    /**
     * Event handler called when a pointerdown event happens outside of the popup. Can be prevented.
     */
    readonly pointerDownOutside = output<RdxOutsidePressDomEvent>();

    /**
     * Event handler called when focus moves outside of the popup. Can be prevented.
     */
    readonly focusOutside = output<FocusEvent>();

    /**
     * Event handler called when an interaction happens outside of the popup. Can be prevented.
     */
    readonly interactOutside = output<RdxOutsidePressDomEvent | FocusEvent>();

    /**
     * Event handler called before focus moves into the popup. Can be prevented.
     */
    readonly openAutoFocus = outputFromObservable(outputToObservable(this.focusScope.mountAutoFocus));

    /**
     * Event handler called before focus returns after the popup is removed. Can be prevented.
     */
    readonly closeAutoFocus = outputFromObservable(outputToObservable(this.focusScope.unmountAutoFocus));

    constructor() {
        // Page scroll lock (Base UI `MenuPositioner`): only while **open** and **modal**, and a hover-open
        // dropdown / context menu does NOT lock (a menubar menu always does when modal). A submenu never
        // locks — its `modal` is already effectively false. For a **touch** open the anchored helper only
        // locks when the popup is effectively viewport-width (ADR 0016 §3), so a small menu stays
        // swipe-to-dismissable on mobile.
        useAnchoredScrollLock(
            computed(() => {
                if (!this.rootContext.isOpen() || !this.rootContext.modal()) {
                    return false;
                }
                if (this.rootContext.parentType() === 'menubar') {
                    return true;
                }
                return this.rootContext.lastOpenChangeReason() !== 'trigger-hover';
            }),
            {
                touchOpen: () => this.rootContext.openedByTouch(),
                element: () => this.elementRef.nativeElement
            }
        );

        // The popup is this layer's floating element (the inside-surface for containment checks). A
        // submenu is a child node in the shared tree, so the capability's logical containment treats an
        // open submenu as "inside" its parent automatically — replacing the legacy `branches` registry.
        this.floatingContext.setFloatingElement(this.elementRef.nativeElement);

        const unregister = this.rootContext.registerTransitionElement(this.elementRef.nativeElement);
        const unregisterPopup = this.rootContext.registerPopup(this.elementRef.nativeElement);
        inject(DestroyRef).onDestroy(() => {
            unregister();
            unregisterPopup();
            clearTimeout(this.searchTimer);
        });

        // Base UI moves focus into a keyboard-opened submenu via its list-navigation layer, not via the
        // focus manager (`initialFocus={false}` for submenus). In Angular, the popup itself is the first
        // point where the submenu DOM definitely exists, so complete the keyboard handoff here.
        effect(() => {
            if (
                !this.rootContext.isOpen() ||
                this.rootContext.parentType() !== 'menu' ||
                this.rootContext.openInteractionType() !== 'keyboard'
            ) {
                return;
            }

            this.scheduleSubmenuKeyboardFocus();
        });

        // Dismissal (ADR 0015): Escape, an outside press, or focus moving outside closes the menu.
        // Escape is owned by the capability (a document-level listener — it works regardless of where
        // focus currently sits, matching Base UI `useDismiss`). Deepest-first: a non-bubbling layer
        // yields to an open child, so Escape closes only the innermost menu — unless `closeParentOnEsc`
        // makes it bubble up the whole chain.
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            // A disabled menu does not dismiss (Base UI `useDismiss({ enabled: !disabled })`): if an open
            // menu becomes disabled it stays put rather than closing on Escape / outside-press / focus-out.
            enabled: () => !this.rootContext.disabled(),
            escapeKey: () => true,
            escapeKeyBubbles: () => this.rootContext.closeParentOnEsc(),
            outsidePress: () => true,
            focusOutside: () => false,
            onEscapeKeyDown: (event) => this.escapeKeyDown.emit(event),
            onPointerDownOutside: (event) => {
                this.pointerDownOutside.emit(event);
                this.interactOutside.emit(event);
            },
            onDismiss: (reason, event) => {
                // Forward the dismissal reason + native event into the menu's open-change channel.
                const menuReason: RdxMenuOpenChangeReason = reason === 'escape-key' ? 'escape-key' : 'outside-press';
                this.rootContext.close(menuReason, event);
                // Escape should restore focus synchronously to the trigger / submenu trigger so the
                // menu chain remains keyboard-stable even before the scope's queued unmount return-focus.
                if (reason === 'escape-key') {
                    this.rootContext.trigger()?.focus({ preventScroll: true });
                }
            }
        });

        // Focus-out close is owned by the floating focus manager, matching Base UI's MenuPopup.
        this.focusManager.focusOut.subscribe((event) => {
            this.focusOutside.emit(event);
            this.interactOutside.emit(event);
            if (!event.defaultPrevented) {
                this.rootContext.close('focus-out', event);
            }
        });
    }

    protected handleCloseParent(event: Event): void {
        event.stopPropagation();
        this.rootContext.close();

        if (this.rootContext.isSubmenu() && this.rootContext.closeParentOnEsc()) {
            this.rootContext.closeParent();
        }
    }

    protected handleKeydown(event: KeyboardEvent): void {
        if (this.rootContext.disabled()) {
            return;
        }

        const items = this.menuItems();
        const currentIndex = this.currentItemIndex(items);

        switch (event.key) {
            case 'ArrowDown': {
                event.preventDefault();
                event.stopPropagation();
                const atEnd = currentIndex >= items.length - 1;
                const next = atEnd
                    ? this.rootContext.loopFocus()
                        ? items[0]
                        : items[items.length - 1]
                    : items[currentIndex + 1];
                this.focusMenuItem(next);
                break;
            }
            case 'ArrowUp': {
                event.preventDefault();
                event.stopPropagation();
                const atStart = currentIndex <= 0;
                const prev = atStart
                    ? this.rootContext.loopFocus()
                        ? items[items.length - 1]
                        : items[0]
                    : items[currentIndex - 1];
                this.focusMenuItem(prev);
                break;
            }
            case 'Home': {
                event.preventDefault();
                event.stopPropagation();
                this.focusMenuItem(items[0]);
                break;
            }
            case 'End': {
                event.preventDefault();
                event.stopPropagation();
                this.focusMenuItem(items[items.length - 1]);
                break;
            }
            case 'ArrowLeft': {
                const trigger = this.rootContext.trigger();
                if (!trigger?.hasAttribute('rdxMenuSubTrigger')) {
                    if (this.rootContext.handlePopupArrowNavigation(-1)) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    break;
                }

                if (this.rootContext.dir() === 'rtl') {
                    if (this.rootContext.handlePopupArrowNavigation(-1)) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    break;
                }

                // Close this popup and return focus to the trigger (used by submenus).
                event.preventDefault();
                event.stopPropagation();
                this.rootContext.close();
                trigger.focus({ preventScroll: true });
                break;
            }
            case 'ArrowRight': {
                const trigger = this.rootContext.trigger();
                if (trigger?.hasAttribute('rdxMenuSubTrigger') && this.rootContext.dir() === 'rtl') {
                    event.preventDefault();
                    event.stopPropagation();
                    this.rootContext.close();
                    trigger.focus({ preventScroll: true });
                    break;
                }

                if (this.rootContext.handlePopupArrowNavigation(1)) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
            // Escape is owned by the dismissal capability (a document-level listener that works
            // regardless of focus position); it closes the menu, restores focus to the trigger, and
            // cascades up the chain when `closeParentOnEsc` is set.
            case 'Tab': {
                // Close on tab to allow natural tab navigation
                this.rootContext.close();
                break;
            }
            default: {
                // Typeahead
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    event.preventDefault();
                    const char = event.key.toLowerCase();
                    this.search += char;
                    clearTimeout(this.searchTimer);
                    this.searchTimer = setTimeout(() => {
                        this.search = '';
                        this.searchTimer = undefined;
                    }, 1000);

                    const query =
                        this.search.length > 1 && [...this.search].every((c) => c === char) ? char : this.search;
                    const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
                    const rotated = [...items.slice(startIndex), ...items.slice(0, startIndex)];
                    const match = rotated.find((item) => item.label.startsWith(query));
                    this.focusMenuItem(match);
                }
                break;
            }
        }
    }

    private scheduleSubmenuKeyboardFocus(attempt = 0): void {
        const view = this.elementRef.nativeElement.ownerDocument.defaultView ?? globalThis;
        view.requestAnimationFrame(() => this.applySubmenuKeyboardFocus(attempt));
    }

    private applySubmenuKeyboardFocus(attempt: number): void {
        const maxAttempts = 10;
        const popup = this.elementRef.nativeElement;

        if (!this.rootContext.isOpen() || this.rootContext.parentType() !== 'menu') {
            return;
        }

        const activeElement = popup.ownerDocument.activeElement as HTMLElement | null;
        if (activeElement && popup.contains(activeElement)) {
            return;
        }

        const items = this.menuItems();
        if (items.length === 0) {
            if (attempt < maxAttempts) {
                this.scheduleSubmenuKeyboardFocus(attempt + 1);
            }
            return;
        }

        this.focusMenuItem(items[0]);
    }

    private menuItems(): RdxMenuCompositeItem[] {
        const compositeItems = getCompositeMenuItems(this.compositeList);

        return compositeItems.length > 0 ? compositeItems : getDomMenuItems(this.elementRef.nativeElement);
    }

    private currentItemIndex(items: readonly RdxMenuCompositeItem[]): number {
        const current = this.elementRef.nativeElement.ownerDocument.activeElement as HTMLElement | null;
        const focusedIndex = items.findIndex((item) => item.element === current);

        if (focusedIndex !== -1) {
            return focusedIndex;
        }

        const activeIndex = this.rootContext.activeIndex();
        return items.findIndex((item) => item.index === activeIndex);
    }

    private focusMenuItem(item: RdxMenuCompositeItem | undefined): void {
        if (!item) {
            return;
        }

        this.rootContext.setActiveIndex(item.index);
        item.element.focus({ preventScroll: true });
    }
}
