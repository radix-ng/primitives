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
import { getCompositeNavigationKeys, RdxCompositeListItem } from '@radix-ng/primitives/composite';
import { BooleanInput, injectId, NumberInput, rdxPlatform } from '@radix-ng/primitives/core';
import {
    createRdxInteractionTypeTracker,
    getInteractionTypeFromEvent,
    RdxFloatingFocusManager
} from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { handleMenuItemKeydown, handleMenuItemKeyup } from './menu-item-keyboard';
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
        '[attr.id]': 'resolvedId()',
        '[attr.aria-controls]': 'submenuContext.isOpen() ? submenuContext.contentId() : undefined',
        '[attr.type]': 'nativeButtonState() ? "button" : undefined',
        role: 'menuitem',
        '[attr.tabindex]': 'parentMenuRoot?.open() && (submenuContext.isOpen() || highlighted()) ? 0 : -1',
        '[attr.aria-haspopup]': '"menu"',
        '[attr.aria-expanded]': 'omitExpanded() ? undefined : submenuContext.isOpen()',
        '[attr.aria-disabled]': 'effectiveDisabled() ? true : undefined',
        '[attr.data-popup-open]': 'submenuContext.isOpen() ? "" : undefined',
        '[attr.data-highlighted]': 'highlighted() ? "" : undefined',
        '[attr.data-disabled]': 'effectiveDisabled() ? "" : undefined',
        '[attr.data-label]': 'label() ?? undefined',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur($event)',
        '(click)': 'onClick($event)',
        '(mousedown)': 'onMouseDown($event)',
        '(pointerdown)': 'onPointerDown($event)',
        '(keydown)': 'onEnter($event)',
        '(keyup)': 'onKeyup($event)',
        '(keydown.arrowleft)': 'onArrowKey($event)',
        '(keydown.arrowright)': 'onArrowKey($event)',
        '(keydown.arrowup)': 'onArrowKey($event)',
        '(keydown.arrowdown)': 'onArrowKey($event)',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerenter)': 'onPointerEnter($event)',
        '(pointerleave)': 'onPointerLeave()',
        '(pointerout)': 'onPointerOut($event)',
        '(rdx-menu-subtrigger-clear-highlight)': 'clearHighlight()'
    }
})
export class RdxMenuSubTrigger {
    private readonly generatedId = injectId('rdx-menu-sub-trigger-');
    /** Native submenu trigger id; defaults to a generated SSR-stable value. */
    readonly id = input<string>();
    protected readonly resolvedId = computed(() => this.id() || this.generatedId);
    protected readonly submenuContext = injectRdxMenuRootContext();
    private readonly submenuRoot = inject(RdxMenuRoot);
    protected readonly parentMenuRoot = this.submenuRoot.parentRoot;
    private readonly listItem = inject(RdxCompositeListItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly isFocused = signal(false);
    private readonly focusManager = inject(RdxFloatingFocusManager, { optional: true });
    private openTimer: ReturnType<typeof setTimeout> | undefined;
    private restTimer: ReturnType<typeof setTimeout> | undefined;
    private closeTimer: ReturnType<typeof setTimeout> | undefined;
    /** Cursor position from the last pointer move over the trigger (safe-polygon apex). */
    private lastPointer: { x: number; y: number } | null = null;
    /** Whether the current open was initiated by hover (vs keyboard / click). */
    private openedByHover = false;
    /** Whether the current open came from the keyboard — read by {@link omitExpanded}. */
    private readonly openedByKeyboard = signal(false);
    private ignoreNextTouchClick = false;
    private readonly inputType = createRdxInteractionTypeTracker();

    /**
     * Whether to drop `aria-expanded` from the trigger. Opening a submenu flips the trigger's expanded
     * state while the trigger still has focus, and VoiceOver announces that change instead of the item
     * focus moves to a moment later — so the first submenu item is never announced. Dropping the state
     * only while the submenu is open avoids the announcement without claiming the submenu is collapsed;
     * `aria-haspopup` still says the item opens a submenu (Base UI `MenuSubmenuTrigger`).
     */
    protected readonly omitExpanded = computed(
        () => rdxPlatform.screenReader.voiceOver && this.submenuContext.isOpen() && this.openedByKeyboard()
    );

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

    /** Highlighted while active/focused in the parent menu; opening a child alone is not a highlight. */
    protected readonly highlighted = computed(
        () =>
            this.parentMenuRoot?.open() !== false &&
            (this.parentMenuRoot ? this.parentMenuRoot.activeIndex() === this.listItem.index() : this.isFocused())
    );
    protected readonly effectiveDisabled = computed(() => this.disabled() || this.submenuContext.disabled());
    protected readonly nativeButtonState = computed(
        () => this.nativeButton() || this.elementRef.nativeElement.tagName === 'BUTTON'
    );

    constructor() {
        this.submenuContext.markAsSubmenu();

        effect((onCleanup) => {
            const el = this.elementRef.nativeElement;
            const unregister = this.submenuContext.registerTrigger(
                el,
                () => this.resolvedId(),
                (event) =>
                    event instanceof MouseEvent
                        ? this.inputType.clickInteractionType(event)
                        : getInteractionTypeFromEvent(event)
            );
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
                this.clearOpenTimers();
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
                onClose: (event) => this.scheduleClose(event),
                cancelClose: () => clearTimeout(this.closeTimer),
                hasOpenChild: () => hasOpenChildSubmenu(reference, popup),
                onLanded: () => {
                    removeTunnel?.();
                    removeTunnel = undefined;
                    ownerDocument.removeEventListener('mousemove', handler);
                    dispose();
                    this.openedByHover = false;
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
            this.clearOpenTimers();
            clearTimeout(this.closeTimer);
        });
    }

    private scheduleClose(event?: MouseEvent): void {
        clearTimeout(this.closeTimer);
        const delay = this.closeDelay() ?? 0;
        if (delay <= 0) {
            this.submenuContext.close('trigger-hover', event);
        } else {
            this.closeTimer = setTimeout(() => this.submenuContext.close('trigger-hover', event), delay);
        }
    }

    protected onFocus(): void {
        if (this.submenuContext.disabled()) {
            return;
        }

        this.isFocused.set(true);
        if (this.focusManager?.isRestoringFocus()) return;
        this.clearSiblingHighlights();
        this.setParentActiveIndex();
    }

    protected onBlur(event?: FocusEvent): void {
        this.isFocused.set(false);
        if (event?.relatedTarget !== null) this.clearParentActiveIndex();
    }

    protected onClick(event: MouseEvent): void {
        if (this.effectiveDisabled()) return;
        const method = this.inputType.clickInteractionType(event);
        if (this.ignoreNextTouchClick && method === 'touch') {
            this.ignoreNextTouchClick = false;
            return;
        }
        if (method === 'touch') {
            this.activateTouch(event);
            return;
        }

        // When the submenu opens on hover (default), hover owns its open/close, so a real **mouse** click
        // is ignored — otherwise it would toggle a just-hover-opened submenu shut (a visible flicker).
        // Base UI: `ignoreMouse: openOnHover`. A keyboard-activated click (`detail === 0`) still opens.
        const isMouseClick = method === 'mouse' || method === 'pen';
        if (this.openOnHover() && isMouseClick) {
            return;
        }

        this.clearOpenTimers();
        this.activatePress(event, method === 'keyboard');
    }

    protected onPointerDown(event: PointerEvent): void {
        this.ignoreNextTouchClick = false;
        this.inputType.recordPointerDown(event);
        if (this.effectiveDisabled()) event.preventDefault();
    }

    protected onMouseDown(event: MouseEvent): void {
        if (this.effectiveDisabled() || event.button !== 0 || this.inputType.clickInteractionType(event) !== 'touch')
            return;
        this.ignoreNextTouchClick = true;
        this.activateTouch(event);
    }

    private activateTouch(event: MouseEvent): void {
        this.clearOpenTimers();
        this.openedByHover = false;
        this.clearSiblingHighlights();
        if (
            this.submenuContext.isOpen() &&
            this.submenuContext.lastOpenChangeReason() !== 'trigger-hover' &&
            this.submenuContext.lastOpenChangeReason() !== 'list-navigation'
        ) {
            this.submenuContext.close('trigger-press', event);
        } else {
            if (!this.submenuContext.isOpen()) this.closeSiblingSubmenus();
            // Touch preserves trigger focus. Hover and arrow openings are promoted on the first
            // press; the next touch press toggles that session. Its compatibility click must not activate twice.
            this.submenuContext.showWithoutAutoFocus('trigger-press', event);
        }
        // A veto leaves the opening session's keyboard/ARIA policy intact. Root updates this
        // metadata only after accepting the native touch request.
        if (this.submenuContext.openInteractionType() === 'touch') this.openedByKeyboard.set(false);
    }

    protected onEnter(event: KeyboardEvent): void {
        handleMenuItemKeydown(
            event,
            this.elementRef.nativeElement,
            this.effectiveDisabled(),
            this.parentMenuRoot?.isTyping() ?? false
        );
    }

    protected onKeyup(event: KeyboardEvent): void {
        handleMenuItemKeyup(event, this.elementRef.nativeElement);
    }

    private activatePress(event: Event, keyboard: boolean): void {
        this.openedByHover = false;
        if (!this.submenuContext.isOpen()) this.openedByKeyboard.set(keyboard);
        this.clearSiblingHighlights();
        if (this.submenuContext.isOpen() && this.submenuContext.lastOpenChangeReason() !== 'trigger-hover') {
            this.submenuContext.close('trigger-press', event);
        } else {
            if (!this.submenuContext.isOpen()) this.closeSiblingSubmenus();
            this.submenuContext.show('first', 'trigger-press', event);
        }
    }

    protected onArrowKey(event: Event): void {
        const parentOrientation = this.parentMenuRoot?.orientation() ?? 'vertical';
        const keys = getCompositeNavigationKeys(
            parentOrientation === 'horizontal' ? 'vertical' : 'horizontal',
            this.submenuContext.dir()
        );
        if (!keys.forwardKeys.includes((event as KeyboardEvent).key)) return;
        if (this.effectiveDisabled()) return;
        this.clearOpenTimers();
        event.preventDefault();
        event.stopPropagation();
        this.openedByHover = false;
        // ARIA follows the opening session. Moving into an already touch-opened child does
        // not turn that session into a keyboard open.
        if (!this.submenuContext.isOpen()) this.openedByKeyboard.set(true);
        this.clearSiblingHighlights();
        if (!this.submenuContext.isOpen()) this.closeSiblingSubmenus();
        this.submenuContext.show('first', 'list-navigation', event);
    }

    protected onPointerMove(event: PointerEvent): void {
        if (event.pointerType !== 'mouse' || this.submenuContext.disabled()) return;

        this.lastPointer = { x: event.clientX, y: event.clientY };
        this.clearSiblingHighlights();
        this.setParentActiveIndex();
        const el = this.elementRef.nativeElement;
        this.parentMenuRoot?.onItemHover(el, event);
        if (this.submenuContext.highlightItemOnHover() && el.ownerDocument.activeElement !== el) {
            el.focus({ preventScroll: true });
        }

        if (this.effectiveDisabled() || !this.openOnHover()) return;
        if (!this.submenuContext.isOpen()) {
            this.closeSiblingSubmenus();
            if (this.restTimer !== undefined && event.movementX ** 2 + event.movementY ** 2 < 2) return;
            clearTimeout(this.restTimer);
            this.restTimer = setTimeout(() => {
                this.restTimer = undefined;
                this.requestHoverOpen(event);
            }, this.delay() ?? 100);
        }
    }

    protected onPointerEnter(event: PointerEvent): void {
        if (event.pointerType !== 'mouse' || this.effectiveDisabled() || !this.openOnHover()) return;
        this.lastPointer = { x: event.clientX, y: event.clientY };
        clearTimeout(this.openTimer);
        // Submenus have both an entry delay and pointer-rest intent. A canceled request leaves
        // the other intent active; an accepted open makes the remaining request a no-op.
        this.openTimer = setTimeout(() => this.requestHoverOpen(event), this.delay() ?? 100);
    }

    private requestHoverOpen(event: PointerEvent): void {
        if (this.submenuContext.isOpen() || this.effectiveDisabled() || !this.openOnHover()) return;
        this.openedByHover = true;
        this.openedByKeyboard.set(false);
        this.submenuContext.show(false, 'trigger-hover', event);
    }

    private clearOpenTimers(): void {
        clearTimeout(this.openTimer);
        clearTimeout(this.restTimer);
        this.restTimer = undefined;
    }

    protected onPointerLeave(): void {
        this.clearOpenTimers();
        if (
            !this.submenuContext.isOpen() &&
            this.elementRef.nativeElement.ownerDocument.activeElement === this.elementRef.nativeElement
        ) {
            this.clearHighlight();
            this.parentMenuRoot?.popupElement()?.focus({ preventScroll: true });
        }
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
        this.clearOpenTimers();
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

            submenuRootsByTrigger.get(trigger)?.close('none');
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
