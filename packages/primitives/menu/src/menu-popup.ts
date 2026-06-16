import { computed, DestroyRef, Directive, effect, ElementRef, inject, output } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import {
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    useAnchoredScrollLock
} from '@radix-ng/primitives/core';
import { RdxDismiss } from '@radix-ng/primitives/dismissable-layer';
import {
    provideFloatingFocusManagerConfig,
    RdxFloatingFocusManager
} from '@radix-ng/primitives/floating-focus-manager';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { RdxPopperContent, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectRdxMenuRootContext, RdxMenuOpenChangeReason } from './menu-root';

/** Selector for focusable menu items within the popup. */
const ITEM_SELECTOR = [
    '[rdxMenuItem]:not([data-disabled])',
    '[rdxMenuCheckboxItem]:not([data-disabled])',
    '[rdxMenuRadioItem]:not([data-disabled])',
    '[rdxMenuLinkItem]:not([data-disabled])',
    '[rdxMenuSubTrigger]:not([data-disabled])'
].join(',');

function getFocusableItems(popup: HTMLElement): HTMLElement[] {
    // Exclude items that belong to a nested child popup (submenu).
    return Array.from(popup.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
        (item) => item.closest('[rdxMenuPopup]') === popup
    );
}

/**
 * A container for the menu contents.
 */
@Directive({
    selector: '[rdxMenuPopup]',
    exportAs: 'rdxMenuPopup',
    hostDirectives: [RdxPopperContent, RdxFloatingNodeRegistration, RdxFloatingFocusManager],
    providers: [
        provideFloatingFocusManagerConfig(() => {
            const rootContext = injectRdxMenuRootContext();
            return {
                // Only a (modal) **context menu** traps focus — Base UI's `FloatingFocusManager modal` is
                // true for `context-menu` alone. Other menus stay non-modal and close on focus-out.
                modal: () => rootContext.parentType() === 'context-menu',
                enabled: () => !rootContext.disabled()
            };
        })
    ],
    host: {
        role: 'menu',
        tabindex: '-1',
        '[attr.aria-orientation]': 'rootContext.orientation()',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
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
    readonly pointerDownOutside = output<PointerEvent>();

    /**
     * Event handler called when focus moves outside of the popup. Can be prevented.
     */
    readonly focusOutside = output<FocusEvent>();

    /**
     * Event handler called when an interaction happens outside of the popup. Can be prevented.
     */
    readonly interactOutside = output<PointerEvent | FocusEvent>();

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
                // Escape restores focus to the trigger (Base UI returns focus on keyboard dismissal).
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

        // Suppress the composed focus scope's auto-focus when the popup mounts **closed** — i.e. an
        // always-mounted popup rendered before its menu opens. Otherwise every closed sibling popup's
        // scope would grab focus to itself on mount and a freshly opened menu would see that as a
        // focus-out and immediately close. When the popup mounts already open (the normal mount-on-open
        // case), the scope's auto-focus is allowed so focus lands in the popup (Escape / typeahead work);
        // the effect below then refines it per `autoFocus`.
        this.focusScope.mountAutoFocus.subscribe((event) => {
            if (!this.rootContext.isOpen()) {
                event.preventDefault();
            }
        });

        // Move focus into the popup when the menu opens — unless the opener suppressed it
        // (e.g. menubar hover-switching, where focus stays on the trigger).
        effect(() => {
            const autoFocus = this.rootContext.autoFocus();
            if (this.rootContext.isOpen() && autoFocus) {
                requestAnimationFrame(() => {
                    // `'popup'` focuses the container without highlighting an item (pointer opening).
                    if (autoFocus === 'popup') {
                        this.elementRef.nativeElement.focus({ preventScroll: true });
                        return;
                    }

                    const items = getFocusableItems(this.elementRef.nativeElement);
                    const item = autoFocus === 'last' ? items[items.length - 1] : items[0];
                    item?.focus({ preventScroll: true });
                });
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
        const el = this.elementRef.nativeElement;
        const items = getFocusableItems(el);
        const current = el.ownerDocument.activeElement as HTMLElement;
        const currentIndex = items.indexOf(current);

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
                next?.focus({ preventScroll: true });
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
                prev?.focus({ preventScroll: true });
                break;
            }
            case 'Home': {
                event.preventDefault();
                event.stopPropagation();
                items[0]?.focus({ preventScroll: true });
                break;
            }
            case 'End': {
                event.preventDefault();
                event.stopPropagation();
                items[items.length - 1]?.focus({ preventScroll: true });
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

                // Close this popup and return focus to the trigger (used by submenus).
                event.preventDefault();
                event.stopPropagation();
                this.rootContext.close();
                trigger.focus({ preventScroll: true });
                break;
            }
            case 'ArrowRight': {
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
                    const match = rotated.find((item) => {
                        const text = (item.dataset['label'] ?? item.textContent?.trim() ?? '').toLowerCase();
                        return text.startsWith(query);
                    });
                    match?.focus({ preventScroll: true });
                }
                break;
            }
        }
    }
}
