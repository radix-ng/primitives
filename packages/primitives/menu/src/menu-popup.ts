import { computed, DestroyRef, Directive, effect, ElementRef, inject, input, isDevMode, output } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { getCompositeNavigationKeys, RdxCompositeList } from '@radix-ng/primitives/composite';
import {
    findTypeaheadMatch,
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    rdxDevWarning,
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
import { getCompositeMenuItems, getDomMenuItems, getFocusableMenuItems, RdxMenuCompositeItem } from './menu-focus';
import { injectRdxMenuRootContext, RdxMenuOpenChangeReason } from './menu-root';

/**
 * A container for the menu contents.
 */
@Directive({
    selector: '[rdxMenuPopup]',
    exportAs: 'rdxMenuPopup',
    hostDirectives: [
        RdxPopperContent,
        RdxFloatingNodeRegistration,
        // `finalFocus` maps to the focus manager's `returnFocus`, overriding the trigger-return policy
        // below when set (Base UI `Menu.Popup finalFocus`); same wiring as Popover/Select.
        { directive: RdxFloatingFocusManager, inputs: ['returnFocus: finalFocus'] },
        RdxCompositeList
    ],
    providers: [
        provideFloatingFocusManagerConfig(() => {
            const rootContext = injectRdxMenuRootContext();
            const popup = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
            const positioner = inject(RdxPopperContentWrapper, { optional: true });

            return {
                initialFocusReady: () => positioner?.isPositioned() ?? true,
                // Only a (modal) **context menu** traps focus — Base UI's `FloatingFocusManager modal` is
                // true for `context-menu` alone. Other menus stay non-modal and close on focus-out.
                modal: () => rootContext.parentType() === 'context-menu',
                // The manager follows mounted/open lifecycle, not menu disabled state. Dismissal remains
                // disabled separately below; focus/marker policy should not disappear if a menu becomes
                // disabled while open, or if `preventUnmountOnClose()` keeps it mounted after close.
                enabled: () => rootContext.present() || rootContext.transitionStatus() === 'ending',
                restoreFocus: () => true,
                previousFocusableElement: () => rootContext.getReturnFocusElement() ?? null,
                getInsideElements: () => rootContext.getCoordinatorElements(),
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
                    if (rootContext.lastOpenChangeReason() === 'trigger-hover') return false;
                    const parentType = rootContext.parentType();
                    if (parentType === 'context-menu') return true;
                    if (parentType === 'menu') return true;

                    if (rootContext.trigger() || parentType === undefined) {
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
        '[attr.id]': 'resolvedId()',
        '[attr.aria-labelledby]':
            'rootContext.isOpen() || rootContext.transitionStatus() === "ending" ? rootContext.triggerId() : undefined',
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
    /** Native popup id, reflected by the owning trigger's aria-controls. */
    readonly id = input<string>();
    protected readonly resolvedId = computed(() => this.id() || this.rootContext.defaultContentId);
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
        inject(DestroyRef).onDestroy(
            this.rootContext.registerPopupNavigationHandler((event) => this.handleArrowNavigation(event))
        );
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
        // Register the wrapper's PHYSICAL side (not the popup's logical `data-side` echo) so safe-polygon
        // geometry stays correct when opened with a logical `side="inline-start"` / `inline-end`.
        const unregisterPopup = this.rootContext.registerPopup(
            this.elementRef.nativeElement,
            this.wrapper?.physicalPlacedSide,
            () => this.resolvedId()
        );
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
                (this.wrapper && !this.wrapper.isPositioned()) ||
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
            escapeKey: (event) =>
                this.rootContext.parentType() !== 'menubar' || this.rootContext.ownsCoordinatorEscape(event),
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
                const target = event.target as Node | null;
                if (
                    reason === 'escape-key' &&
                    !this.rootContext.isOpen() &&
                    (this.elementRef.nativeElement.contains(target) || this.rootContext.trigger()?.contains(target))
                ) {
                    this.rootContext.getReturnFocusElement()?.focus({ preventScroll: true });
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
        this.rootContext.close('none');

        if (this.rootContext.isSubmenu() && this.rootContext.closeParentOnEsc()) {
            this.rootContext.closeParent();
        }
    }

    private handleArrowNavigation(event: KeyboardEvent): boolean {
        // A bubbled key from a portaled child reaches the bar's delegated handler before this
        // ancestor list. A key originating in this popup is consumed by its own navigation first.
        if (
            this.rootContext.parentType() === 'menubar' &&
            event.target instanceof Node &&
            !this.elementRef.nativeElement.contains(event.target) &&
            this.rootContext.handlePopupArrowNavigation(event)
        ) {
            event.preventDefault();
            event.stopPropagation();
            return true;
        }
        if (this.rootContext.disabled()) {
            return this.rootContext.parentType() === 'menubar'
                ? this.rootContext.handlePopupArrowNavigation(event)
                : false;
        }
        const orientation = this.rootContext.orientation();
        const dir = this.rootContext.dir();
        const keys = getCompositeNavigationKeys(orientation, dir);
        const crossKeys = getCompositeNavigationKeys(orientation === 'horizontal' ? 'vertical' : 'horizontal', dir);
        const parentOrientation = this.rootContext.parentOrientation();

        if (parentOrientation && crossKeys.backwardKeys.includes(event.key)) {
            const parentKeys = getCompositeNavigationKeys(parentOrientation, dir);
            const relay = parentKeys.forwardKeys.includes(event.key) || parentKeys.backwardKeys.includes(event.key);
            this.rootContext.closeForNavigation(event, !relay);
            if (relay) this.rootContext.handlePopupArrowNavigation(event);
            return true;
        }

        const forward = keys.forwardKeys.includes(event.key);
        if (forward || keys.backwardKeys.includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            const items = this.menuItems();
            const current = this.currentItemIndex(items);
            // Retain the requested first index while an application-owned list is empty.
            if (forward && items.length === 0) this.rootContext.setActiveIndex(0);
            const next = current + (forward ? 1 : -1);
            const destination =
                next >= items.length
                    ? this.rootContext.loopFocus()
                        ? 0
                        : items.length - 1
                    : next < 0
                      ? this.rootContext.loopFocus()
                          ? items.length - 1
                          : 0
                      : next;
            this.focusMenuItem(items[destination]);
            return true;
        }

        if (this.rootContext.handlePopupArrowNavigation(event)) {
            event.preventDefault();
            event.stopPropagation();
            return true;
        }
        return false;
    }

    protected handleKeydown(event: KeyboardEvent): void {
        if (event.key.startsWith('Arrow')) {
            this.handleArrowNavigation(event);
            return;
        }
        if (this.rootContext.disabled()) {
            return;
        }

        const items = this.menuItems();
        const currentIndex = this.currentItemIndex(items);

        switch (event.key) {
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
            // Escape is owned by the dismissal capability (a document-level listener that works
            // regardless of focus position); it closes the menu, restores focus to the trigger, and
            // cascades up the chain when `closeParentOnEsc` is set.
            case 'Tab': {
                // Portal guards move focus through the trigger's logical tab order. Closing here
                // removes the current element before the browser can perform its Tab default.
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
                    const index = findTypeaheadMatch(
                        items.map((item) => item.label),
                        query,
                        startIndex
                    );
                    this.focusMenuItem(index === undefined ? undefined : items[index]);
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

    // The DOM fallback covers a popup whose items were all projected past it: their composite
    // registration resolves through the declaring injector tree, not the rendered one, so they never
    // reach this popup's list (see ADR 0001, "Item ownership across content projection"). It is
    // all-or-nothing — a popup mixing inline and projected items keeps the inline ones and drops the
    // rest, which `warnOnItemsOutsideComposite` reports in dev. Menu has no `RdxCompositeItemOwner`
    // bridge because `rdxMenuSubTrigger` belongs to the parent popup's list, so ownership would have to
    // be resolved per popup rather than per root.
    private menuItems(): RdxMenuCompositeItem[] {
        const compositeItems = getCompositeMenuItems(this.compositeList);

        if (isDevMode()) {
            this.warnOnItemsOutsideComposite();
        }

        return compositeItems.length > 0 ? compositeItems : getDomMenuItems(this.elementRef.nativeElement);
    }

    /**
     * Dev-mode check for the mixed popup the DOM fallback cannot rescue. Runs here, at the point
     * navigation actually resolves its items, rather than in a render effect: by then registration has
     * settled, so an item that is still missing from the map is genuinely owned by another list.
     * Compares registration rather than counts — a registered item hidden from `getCompositeMenuItems`
     * is not a projection problem.
     */
    private warnOnItemsOutsideComposite(): void {
        const registered = this.compositeList.itemMap();

        if (registered.size === 0) {
            return;
        }

        const hasStrayItem = getFocusableMenuItems(this.elementRef.nativeElement).some((item) => !registered.has(item));

        if (hasStrayItem) {
            rdxDevWarning(
                'menu/items-outside-composite',
                '`rdxMenuPopup` contains menu items that are not registered with it, so keyboard ' +
                    'navigation and typeahead skip them. This happens when a wrapper component projects ' +
                    'items into a popup declared in its own template: registration resolves through the ' +
                    'declaring template, not the rendered DOM. Declare the items alongside the popup, or ' +
                    "compose `rdxMenuPopup` onto the wrapper's host element.",
                'components/menu'
            );
        }
    }

    private currentItemIndex(items: readonly RdxMenuCompositeItem[]): number {
        const activeIndex = this.rootContext.activeIndex();
        const highlighted = items.findIndex((item) => item.index === activeIndex);
        if (highlighted !== -1) return highlighted;
        const current = this.elementRef.nativeElement.ownerDocument.activeElement;
        return items.findIndex((item) => item.element === current);
    }

    private focusMenuItem(item: RdxMenuCompositeItem | undefined): void {
        if (!item) {
            return;
        }

        this.rootContext.setActiveIndex(item.index);
        item.element.focus({ preventScroll: true });
    }
}
