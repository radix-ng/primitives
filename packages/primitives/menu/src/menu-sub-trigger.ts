import { isPlatformBrowser } from '@angular/common';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    numberAttribute,
    PLATFORM_ID,
    signal
} from '@angular/core';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import { BooleanInput, NumberInput } from '@radix-ng/primitives/core';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { getFocusableMenuItems } from './menu-focus';
import { injectRdxMenuRootContext, RdxMenuRoot } from './menu-root';
import {
    applyPointerTunnel,
    createSafePolygonHandler,
    hasOpenChildSubmenu,
    registerOpenSubmenu
} from './menu-safe-polygon';

const numberOrUndefined = (value: NumberInput | undefined) => (value == null ? undefined : numberAttribute(value));
const submenuRootsByTrigger = new WeakMap<HTMLElement, RdxMenuRoot>();

/**
 * An item inside a parent menu that opens a nested submenu.
 *
 * Place this inside `ng-container rdxMenuRoot` that wraps both the trigger
 * and the submenu positioner. The inner root provides the submenu context;
 * the outer popup discovers this element via `[rdxMenuSubTrigger]` in its
 * ITEM_SELECTOR and includes it in keyboard navigation.
 */
@Directive({
    selector: '[rdxMenuSubTrigger]',
    exportAs: 'rdxMenuSubTrigger',
    hostDirectives: [RdxPopperAnchor, RdxCompositeListItem],
    host: {
        '[attr.type]': 'nativeButtonState() ? "button" : undefined',
        role: 'menuitem',
        '[attr.tabindex]': 'parentMenuRoot?.open() && highlighted() ? 0 : -1',
        '[attr.aria-haspopup]': '"menu"',
        '[attr.aria-expanded]': 'submenuContext.isOpen()',
        '[attr.aria-disabled]': 'effectiveDisabled() ? true : undefined',
        '[attr.data-popup-open]': 'submenuContext.isOpen() ? "" : undefined',
        '[attr.data-highlighted]': 'highlighted() ? "" : undefined',
        '[attr.data-disabled]': 'effectiveDisabled() ? "" : undefined',
        '[attr.data-label]': 'label() ?? undefined',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(click)': 'onClick($event)',
        '(keydown.enter)': 'onEnter($event)',
        '(keydown.space)': 'onEnter($event)',
        '(keydown.arrowleft)': 'onArrowLeft($event)',
        '(keydown.arrowright)': 'onArrowRight($event)',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerleave)': 'onPointerLeave()',
        '(pointerout)': 'onPointerOut($event)',
        '(rdx-menu-subtrigger-clear-highlight)': 'clearHighlight()'
    }
})
export class RdxMenuSubTrigger {
    protected readonly submenuContext = injectRdxMenuRootContext();
    private readonly submenuRoot = inject(RdxMenuRoot);
    protected readonly parentMenuRoot = this.submenuRoot.parentRoot;
    private readonly listItem = inject(RdxCompositeListItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly isFocused = signal(false);
    private openTimer: ReturnType<typeof setTimeout> | undefined;
    private closeTimer: ReturnType<typeof setTimeout> | undefined;
    /** Cursor position from the last pointer move over the trigger (safe-polygon apex). */
    private lastPointer: { x: number; y: number } | null = null;
    /** Whether the current open was initiated by hover (vs keyboard / click). */
    private openedByHover = false;
    private ignoreNextKeyboardClick = false;

    /** Whether this trigger (and therefore the submenu) is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether this trigger should be treated as a native button. Auto-detected for `<button>`. */
    readonly nativeButton = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether hovering the trigger opens the submenu. */
    readonly openOnHover = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** Delay before hover opens the submenu, in milliseconds. */
    readonly delay = input<number | undefined, NumberInput | undefined>(100, { transform: numberOrUndefined });

    /** Delay before a pending hover close runs, in milliseconds. */
    readonly closeDelay = input<number | undefined, NumberInput | undefined>(0, { transform: numberOrUndefined });

    /** Explicit typeahead label. When set, overrides textContent for character search. */
    readonly label = input<string | undefined>(undefined);

    /** Highlighted when active in the parent menu or while the submenu is open. */
    protected readonly highlighted = computed(
        () =>
            this.parentMenuRoot?.activeIndex() === this.listItem.index() ||
            this.isFocused() ||
            this.submenuContext.isOpen()
    );
    protected readonly effectiveDisabled = computed(() => this.disabled() || this.submenuContext.disabled());
    protected readonly nativeButtonState = computed(
        () => this.nativeButton() || this.elementRef.nativeElement.tagName === 'BUTTON'
    );

    constructor() {
        this.submenuContext.markAsSubmenu();

        effect((onCleanup) => {
            const el = this.elementRef.nativeElement;
            const unregister = this.submenuContext.registerTrigger(el);
            submenuRootsByTrigger.set(el, this.submenuRoot);

            onCleanup(() => {
                unregister();
                submenuRootsByTrigger.delete(el);
            });
        });

        effect(() => {
            this.listItem.setMetadata({
                type: 'submenu-trigger',
                disabled: this.effectiveDisabled(),
                label: this.label()
            });
        });

        // While this submenu is open by hover, it owns the decision to close itself: a document
        // `mousemove` handler keeps it open while the cursor traverses the safe polygon toward the
        // popup, and a pointer-events tunnel stops siblings from stealing it mid-traversal.
        effect((onCleanup) => {
            const open = this.submenuContext.isOpen();
            const popup = this.submenuContext.popupElement();

            // Once closed, forget how this open started so the next (possibly keyboard / programmatic)
            // open doesn't re-arm the hover tunnel from a stale flag.
            if (!open) {
                this.openedByHover = false;
                this.lastPointer = null;
                return;
            }

            if (!popup || !this.openedByHover || !this.lastPointer || !this.isBrowser) {
                return;
            }

            const reference = this.elementRef.nativeElement;
            const ownerDocument = reference.ownerDocument;
            const scope = reference.closest<HTMLElement>('[rdxMenuPopup]') ?? ownerDocument.body;
            const unregisterOpen = registerOpenSubmenu(reference, popup);
            let removeTunnel: (() => void) | undefined = applyPointerTunnel(scope, reference, popup);

            const { handler, dispose } = createSafePolygonHandler({
                reference,
                floating: popup,
                // Physical side from context (live: unresolved at open, flips on collision). NOT the popup's
                // `data-side`, which is the logical `inline-*` echo the geometry can't interpret.
                side: () => this.submenuContext.popupPhysicalSide() ?? 'right',
                x: this.lastPointer.x,
                y: this.lastPointer.y,
                onClose: () => this.scheduleClose(),
                cancelClose: () => clearTimeout(this.closeTimer),
                hasOpenChild: () => hasOpenChildSubmenu(reference, popup),
                onLanded: () => {
                    removeTunnel?.();
                    removeTunnel = undefined;
                }
            });

            ownerDocument.addEventListener('mousemove', handler);
            onCleanup(() => {
                ownerDocument.removeEventListener('mousemove', handler);
                dispose();
                removeTunnel?.();
                unregisterOpen();
                clearTimeout(this.closeTimer);
            });
        });

        this.destroyRef.onDestroy(() => {
            clearTimeout(this.openTimer);
            clearTimeout(this.closeTimer);
        });
    }

    private scheduleClose(): void {
        clearTimeout(this.closeTimer);
        const delay = this.closeDelay() ?? 0;
        if (delay <= 0) {
            this.submenuContext.close();
        } else {
            this.closeTimer = setTimeout(() => this.submenuContext.close(), delay);
        }
    }

    protected onFocus(): void {
        if (this.submenuContext.disabled()) {
            return;
        }

        this.clearSiblingHighlights();
        this.isFocused.set(true);
        this.setParentActiveIndex();
    }

    protected onBlur(): void {
        this.isFocused.set(false);
        this.clearParentActiveIndex();
    }

    protected onClick(event: MouseEvent): void {
        if (this.effectiveDisabled()) return;

        if (this.ignoreNextKeyboardClick && event.detail === 0) {
            this.ignoreNextKeyboardClick = false;
            return;
        }

        const wasOpen = this.submenuContext.isOpen();
        // When the submenu opens on hover (default), hover owns its open/close, so a real **mouse** click
        // is ignored — otherwise it would toggle a just-hover-opened submenu shut (a visible flicker).
        // Base UI: `ignoreMouse: openOnHover`. A keyboard-activated click (`detail === 0`) still opens.
        const isMouseClick = event.detail > 0;
        if (this.openOnHover() && isMouseClick) {
            return;
        }

        this.openedByHover = false;
        this.clearSiblingHighlights();

        if (this.submenuContext.isOpen()) {
            // Toggle (close) only for a click-driven submenu (Base UI `toggle: !openOnHover`).
            if (!this.openOnHover()) {
                this.submenuContext.close();
            }
            return;
        }

        this.closeSiblingSubmenus();
        this.submenuContext.show('first', 'none', event);

        if (event.detail === 0 && !wasOpen && this.submenuContext.isOpen()) {
            this.focusFirstSubmenuItem();
        }
    }

    protected onEnter(event: Event): void {
        if (this.effectiveDisabled()) return;

        event.preventDefault();
        event.stopPropagation();
        this.ignoreNextKeyboardClick = true;
        this.openedByHover = false;
        this.clearSiblingHighlights();

        if (!this.submenuContext.isOpen()) {
            this.closeSiblingSubmenus();
            this.submenuContext.show('first', 'none', event);
        }

        this.focusFirstSubmenuItem();
    }

    protected onArrowRight(event: Event): void {
        if (this.submenuContext.dir() === 'rtl') {
            return;
        }

        if (this.effectiveDisabled()) return;
        event.preventDefault();
        event.stopPropagation();
        this.openedByHover = false;
        this.clearSiblingHighlights();
        if (!this.submenuContext.isOpen()) {
            this.closeSiblingSubmenus();
            this.submenuContext.show('first', 'none', event);
            this.focusFirstSubmenuItem();
        }
    }

    protected onArrowLeft(event: Event): void {
        if (this.submenuContext.dir() !== 'rtl') {
            return;
        }

        if (this.effectiveDisabled()) return;
        event.preventDefault();
        event.stopPropagation();
        this.openedByHover = false;
        this.clearSiblingHighlights();
        if (!this.submenuContext.isOpen()) {
            this.closeSiblingSubmenus();
            this.submenuContext.show('first', 'none', event);
            this.focusFirstSubmenuItem();
        }
    }

    protected onPointerMove(event: PointerEvent): void {
        if (event.pointerType !== 'mouse' || this.effectiveDisabled() || !this.openOnHover()) return;

        this.lastPointer = { x: event.clientX, y: event.clientY };
        this.clearSiblingHighlights();
        this.setParentActiveIndex();
        const el = this.elementRef.nativeElement;
        if (this.submenuContext.highlightItemOnHover() && el.ownerDocument.activeElement !== el) {
            el.focus({ preventScroll: true });
        }

        if (!this.submenuContext.isOpen()) {
            clearTimeout(this.openTimer);
            this.closeSiblingSubmenus();
            this.openTimer = setTimeout(() => {
                this.openedByHover = true;
                this.submenuContext.show(false, 'trigger-hover');
            }, this.delay() ?? 100);
        }
    }

    protected onPointerLeave(): void {
        clearTimeout(this.openTimer);
    }

    /**
     * Backup cancellation for a `pointerleave` that Chrome can drop during a fast pointer sweep across
     * adjacent triggers, which would otherwise leave the delayed hover-open armed and open a stale
     * submenu for a trigger the pointer has already left (stranding the parent at `pointer-events: none`).
     * `pointerout` bubbles, so it also fires while crossing between the trigger's own descendants — those
     * (where `relatedTarget` is still inside the trigger) must not cancel the pending open. Base UI parity
     * (`guardStaleOpen`); safe on this single, hover-driven trigger.
     */
    protected onPointerOut(event: PointerEvent): void {
        if (this.elementRef.nativeElement.contains(event.relatedTarget as Node | null)) {
            return;
        }
        clearTimeout(this.openTimer);
    }

    protected clearHighlight(): void {
        this.isFocused.set(false);
        this.clearParentActiveIndex();
    }

    private closeSiblingSubmenus(): void {
        const currentTrigger = this.elementRef.nativeElement;
        const parentPopup = currentTrigger.closest<HTMLElement>('[rdxMenuPopup]');

        if (!parentPopup) return;

        parentPopup.querySelectorAll<HTMLElement>('[rdxMenuSubTrigger]').forEach((trigger) => {
            if (trigger === currentTrigger || trigger.closest('[rdxMenuPopup]') !== parentPopup) {
                return;
            }

            submenuRootsByTrigger.get(trigger)?.close();
            trigger.dispatchEvent(new CustomEvent('rdx-menu-subtrigger-clear-highlight'));
        });
    }

    private clearSiblingHighlights(): void {
        const currentTrigger = this.elementRef.nativeElement;
        const parentPopup = currentTrigger.closest<HTMLElement>('[rdxMenuPopup]');

        if (!parentPopup) return;

        parentPopup.querySelectorAll<HTMLElement>('[rdxMenuSubTrigger]').forEach((trigger) => {
            if (trigger === currentTrigger || trigger.closest('[rdxMenuPopup]') !== parentPopup) {
                return;
            }

            trigger.dispatchEvent(new CustomEvent('rdx-menu-subtrigger-clear-highlight'));
        });
    }

    private focusFirstSubmenuItem(attempt = 0): void {
        const maxAttempts = 10;
        const ownerDocument = this.elementRef.nativeElement.ownerDocument;

        const run = () => {
            if (!this.submenuContext.isOpen()) {
                return;
            }

            const popup = this.submenuContext.popupElement();
            if (!popup) {
                if (attempt < maxAttempts) {
                    this.focusFirstSubmenuItem(attempt + 1);
                }
                return;
            }

            const items = getFocusableMenuItems(popup);
            if (items.length === 0) {
                if (attempt < maxAttempts) {
                    this.focusFirstSubmenuItem(attempt + 1);
                }
                return;
            }

            const firstItem = items[0];
            if (ownerDocument.activeElement !== firstItem) {
                firstItem?.focus({ preventScroll: true });
            }
        };

        if (this.isBrowser) {
            requestAnimationFrame(run);
        } else {
            setTimeout(run);
        }
    }

    private setParentActiveIndex(): void {
        const index = this.listItem.index();
        if (index === -1 || !this.parentMenuRoot || this.parentMenuRoot.effectiveDisabled()) {
            return;
        }

        this.parentMenuRoot.setActiveIndex(index);
    }

    private clearParentActiveIndex(): void {
        if (this.parentMenuRoot?.activeIndex() === this.listItem.index()) {
            this.parentMenuRoot.setActiveIndex(null);
        }
    }
}
