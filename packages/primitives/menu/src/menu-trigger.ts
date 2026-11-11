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
import { getCompositeNavigationKeys } from '@radix-ng/primitives/composite';
import { BooleanInput, injectId, isMouseWithinBounds, NumberInput } from '@radix-ng/primitives/core';
import { createRdxTriggerInteraction, useTriggerFocusGuards } from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { getFocusableMenuItems } from './menu-focus';
import { findMenuOwnerId } from './menu-owner';
import { injectRdxMenuRootContext } from './menu-root';
import { applyPointerTunnel, createSafePolygonHandler, hasOpenChildSubmenu } from './menu-safe-polygon';

const numberOrUndefined = (value: NumberInput | undefined) => (value == null ? undefined : numberAttribute(value));

/**
 * A button that opens the menu.
 */
@Directive({
    selector: '[rdxMenuTrigger]',
    exportAs: 'rdxMenuTrigger',
    hostDirectives: [RdxPopperAnchor],
    host: {
        '[attr.id]': 'resolvedId()',
        '[attr.aria-controls]': 'rootContext.isOpen() ? rootContext.contentId() : undefined',
        '[attr.type]': 'nativeButtonState() ? "button" : undefined',
        '[attr.role]':
            'rootContext.hasTriggerInteractionHandler() ? "menuitem" : nativeButtonState() ? undefined : "button"',
        '[attr.aria-haspopup]': '"menu"',
        '[attr.aria-expanded]': 'triggerInteraction.ariaExpanded()',
        '[attr.aria-disabled]': 'isDisabled() ? true : undefined',
        '[attr.disabled]': 'nativeButtonState() && isDisabled() ? "" : undefined',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-popup-open]': 'triggerInteraction.dataPopupOpen()',
        '[attr.data-pressed]': 'pressed() ? "" : undefined',
        '[style.pointer-events]': 'rootContext.isOpen() && rootContext.modal() ? "auto" : undefined',
        '(pointerdown)': 'handlePointerDown($event)',
        '(pointerup)': 'pressed.set(false)',
        '(pointercancel)': 'pressed.set(false)',
        '(mousedown)': 'handleMouseDown($event)',
        '(click)': 'handleClick($event)',
        '(pointerenter)': 'handlePointerEnter($event)',
        '(pointermove)': 'handlePointerMove($event)',
        '(pointerleave)': 'handlePointerLeave($event)',
        '(keydown.arrowdown)': 'handleArrowDown($event)',
        '(keydown.arrowup)': 'handleArrowUp($event)',
        '(keydown.arrowleft)': 'handleArrowLeft($event)',
        '(keydown.arrowright)': 'handleArrowRight($event)',
        '(keydown.home)': 'handleHome($event)',
        '(keydown.end)': 'handleEnd($event)',
        '(keydown.escape)': 'handleEscape($event)',
        '(keydown.enter)': 'handleKeyboardToggle($event)',
        '(keydown.space)': 'handleKeyboardToggle($event)'
    }
})
export class RdxMenuTrigger {
    protected readonly rootContext = injectRdxMenuRootContext();
    private readonly generatedId = injectId('rdx-menu-trigger-');
    /** Native trigger id; defaults to a generated SSR-stable value. */
    readonly id = input<string>();
    protected readonly resolvedId = computed(() => this.id() || this.generatedId);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private openTimer: ReturnType<typeof setTimeout> | undefined;
    private closeTimer: ReturnType<typeof setTimeout> | undefined;
    private allowMouseUpTriggerTimer: ReturnType<typeof setTimeout> | undefined;
    private lastPointer: { x: number; y: number } | null = null;
    private openedByHover = false;
    private ignoreNextClick: 'mouse' | 'keyboard' | null = null;
    private readonly handleDocumentMouseUp = (event: MouseEvent): void => {
        clearTimeout(this.allowMouseUpTriggerTimer);
        this.allowMouseUpTriggerTimer = undefined;
        this.rootContext.setAllowMouseUpTrigger(false);

        const trigger = this.elementRef.nativeElement;
        const target = event.target as Node | null;
        const popup = this.rootContext.popupElement();

        if (target && (trigger.contains(target) || popup?.contains(target))) {
            return;
        }

        // Everything else belonging to this menu chain: the positioner wrapping the popup, and a
        // submenu portaled as a DOM sibling rather than nested inside it (Base UI `findRootOwnerId`).
        if (target && findMenuOwnerId(target) === this.rootContext.ownerId()) {
            return;
        }

        // A release a few pixels off the trigger — pointer drift, or a decorative pseudo-element that
        // renders past the trigger's box but takes no pointer events — is still a release *on* the
        // trigger, and must not cancel the menu it just opened (Base UI `MenuTrigger`).
        if (isMouseWithinBounds(event, trigger)) {
            return;
        }

        if (this.rootContext.isOpen()) {
            this.rootContext.close('cancel-open', event);
        }
    };

    /** Whether this trigger should be treated as a native button. Auto-detected for `<button>`. */
    readonly nativeButton = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether this trigger is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether hovering the trigger opens the menu. */
    readonly openOnHover = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Delay before hover opens the menu, in milliseconds. */
    readonly delay = input<number | undefined, NumberInput | undefined>(100, { transform: numberOrUndefined });

    /** Delay before hover leave closes the menu, in milliseconds. */
    readonly closeDelay = input<number | undefined, NumberInput | undefined>(undefined, {
        transform: numberOrUndefined
    });

    protected readonly nativeButtonState = computed(
        () => this.nativeButton() || this.elementRef.nativeElement.tagName === 'BUTTON'
    );

    /** Whether the trigger is currently pressed (pointer down), for Base UI's `data-pressed`. */
    protected readonly pressed = signal(false);

    protected readonly isDisabled = computed(() => this.rootContext.disabled() || this.disabled());
    protected readonly triggerInteraction = createRdxTriggerInteraction({
        trigger: () => this.elementRef.nativeElement,
        activeTrigger: () => this.rootContext.trigger(),
        open: () => this.rootContext.isOpen(),
        disabled: () => this.isDisabled()
    });

    constructor() {
        effect((onCleanup) => {
            const el = this.elementRef.nativeElement;
            const unregister = this.rootContext.registerTrigger(el, () => this.resolvedId());
            onCleanup(unregister);
        });

        effect((onCleanup) => {
            const open = this.rootContext.isOpen();
            const popup = this.rootContext.popupElement();
            // A click promotes the still-open menu; release its hover tunnel when the reason changes.
            const hover = this.rootContext.lastOpenChangeReason() === 'trigger-hover';

            if (!open) {
                this.openedByHover = false;
                this.lastPointer = null;
                return;
            }

            if (!popup || !hover || !this.openedByHover || !this.lastPointer || !this.isBrowser) {
                return;
            }

            const trigger = this.elementRef.nativeElement;
            const ownerDocument = trigger.ownerDocument;
            let removeTunnel: (() => void) | undefined = applyPointerTunnel(ownerDocument.body, trigger, popup);
            const { handler, dispose } = createSafePolygonHandler({
                reference: trigger,
                floating: popup,
                // Physical side from context — the popup's `data-side` may be a logical `inline-*` echo.
                side: () => this.rootContext.popupPhysicalSide() ?? 'bottom',
                x: this.lastPointer.x,
                y: this.lastPointer.y,
                onClose: (event) => {
                    if (this.openedByHover) this.scheduleClose(event);
                },
                cancelClose: () => this.clearCloseTimer(),
                hasOpenChild: () => hasOpenChildSubmenu(trigger, popup),
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
                this.clearCloseTimer();
            });
        });

        // (A press/focus on the trigger no longer needs a dismissable-layer branch to avoid
        // self-dismissal: the trigger is registered in the menu's floating context, so the dismissal
        // capability already treats it as "inside" — ADR 0015 trigger registry replaces the branch.)

        useTriggerFocusGuards({
            trigger: () => this.elementRef.nativeElement,
            close: (event) => this.rootContext.close('focus-out', event),
            beforeContentFocusGuard: () => this.rootContext.beforeContentFocusGuard(),
            enabled: () => this.triggerInteraction.isActive(),
            popupElement: () => this.rootContext.popupElement()
        });

        this.destroyRef.onDestroy(() => {
            this.clearOpenTimer();
            this.clearCloseTimer();
            this.clearMouseUpGuard();
        });
    }

    protected handleMouseDown(event: MouseEvent): void {
        if (this.isDisabled() || event.button !== 0) {
            return;
        }

        this.clearOpenTimer();
        this.clearCloseTimer();

        if (this.rootContext.hasTriggerInteractionHandler()) {
            const wasOpen = this.rootContext.isOpen();
            if (this.rootContext.handleTriggerInteraction({ type: 'mousedown', event })) {
                this.ignoreNextClick = 'mouse';
                this.openedByHover = false;
                if (!wasOpen && this.rootContext.isOpen()) this.armMouseUpGuard(event.currentTarget as HTMLElement);
            }
            return;
        }

        if (
            this.openOnHover() &&
            this.rootContext.isOpen() &&
            this.rootContext.lastOpenChangeReason() === 'trigger-hover'
        ) {
            this.ignoreNextClick = 'mouse';
            this.rootContext.show(false, 'trigger-press', event);
            this.openedByHover = this.rootContext.lastOpenChangeReason() === 'trigger-hover';
            return;
        }

        const wasOpen = this.rootContext.isOpen();
        this.clearMouseUpGuard();
        this.ignoreNextClick = 'mouse';
        this.openedByHover = false;
        this.rootContext.toggle('trigger-press', event);

        if (!wasOpen && this.rootContext.isOpen()) {
            this.armMouseUpGuard(event.currentTarget as HTMLElement);
        }
    }

    protected handlePointerDown(event: PointerEvent): void {
        this.triggerInteraction.recordPointerDown(event);
        if (!this.isDisabled() && event.button === 0) {
            this.pressed.set(true);
        }
    }

    protected handleClick(event: MouseEvent): void {
        if (this.isDisabled()) {
            return;
        }

        const wasOpen = this.rootContext.isOpen();

        if (this.ignoreNextClick === 'mouse' && event.detail > 0) {
            this.ignoreNextClick = null;
            // Safari can blur the hovered popup onto body while applying the button's native
            // mousedown action. Keep an accepted promotion keyboard-ready without stealing focus
            // from a trigger/control the browser or consumer actually focused.
            if (
                this.openOnHover() &&
                this.rootContext.isOpen() &&
                this.rootContext.lastOpenChangeReason() === 'trigger-press' &&
                this.elementRef.nativeElement.ownerDocument.activeElement ===
                    this.elementRef.nativeElement.ownerDocument.body
            ) {
                this.rootContext.show('popup', 'trigger-press', event);
            }
            return;
        }
        if (this.rootContext.handleTriggerInteraction({ type: 'click', event })) {
            if (event.detail === 0 && !wasOpen && this.rootContext.isOpen()) {
                this.restoreKeyboardPopupFocus();
            }
            return;
        }

        if (
            this.ignoreNextClick &&
            ((this.ignoreNextClick === 'mouse' && event.detail > 0) ||
                (this.ignoreNextClick === 'keyboard' && event.detail === 0))
        ) {
            if (this.ignoreNextClick === 'keyboard') {
                this.restoreKeyboardPopupFocus();
            }
            this.ignoreNextClick = null;
            return;
        }

        this.openedByHover = false;
        this.rootContext.toggle('trigger-press', event);
        if (event.detail === 0 && !wasOpen && this.rootContext.isOpen()) {
            this.restoreKeyboardPopupFocus();
        }
    }

    protected handleArrowDown(event: Event): void {
        this.handleArrowNavigation(event, 'arrowdown');
    }

    protected handleArrowUp(event: Event): void {
        this.handleArrowNavigation(event, 'arrowup');
    }

    protected handleArrowLeft(event: Event): void {
        this.handleArrowNavigation(event, 'arrowleft');
    }

    protected handleArrowRight(event: Event): void {
        this.handleArrowNavigation(event, 'arrowright');
    }

    private handleArrowNavigation(event: Event, type: 'arrowdown' | 'arrowup' | 'arrowleft' | 'arrowright'): void {
        if (this.rootContext.handleTriggerInteraction({ type, event })) return;
        const keys = getCompositeNavigationKeys(this.rootContext.orientation(), this.rootContext.dir());
        const key = (event as KeyboardEvent).key;
        const autoFocus = keys.forwardKeys.includes(key)
            ? 'first'
            : keys.backwardKeys.includes(key)
              ? 'last'
              : undefined;
        if (autoFocus === undefined) return;
        event.preventDefault();
        if (!this.isDisabled()) this.rootContext.show(autoFocus, 'list-navigation', event);
    }

    protected handleHome(event: Event): void {
        this.rootContext.handleTriggerInteraction({ type: 'home', event });
    }

    protected handleEnd(event: Event): void {
        this.rootContext.handleTriggerInteraction({ type: 'end', event });
    }

    protected handleEscape(event: Event): void {
        this.rootContext.handleTriggerInteraction({ type: 'escape', event });
    }

    protected handleKeyboardToggle(event: Event): void {
        const wasOpen = this.rootContext.isOpen();
        const interactionType = event instanceof KeyboardEvent && event.key === ' ' ? 'space' : 'enter';

        if (this.nativeButtonState() && !this.rootContext.hasTriggerInteractionHandler()) {
            return;
        }

        if (this.rootContext.handleTriggerInteraction({ type: interactionType, event })) {
            event.preventDefault();
            this.ignoreNextClick = this.nativeButtonState() ? 'keyboard' : null;
            this.openedByHover = false;
            if (!wasOpen && this.rootContext.isOpen()) {
                this.restoreKeyboardPopupFocus();
            }
            return;
        }

        event.preventDefault();
        this.ignoreNextClick = this.nativeButtonState() ? 'keyboard' : null;
        this.openedByHover = false;
        this.rootContext.toggle('trigger-press', event);
        if (!wasOpen && this.rootContext.isOpen()) {
            this.restoreKeyboardPopupFocus();
        }
    }

    protected handlePointerEnter(event: PointerEvent): void {
        if (this.rootContext.handleTriggerInteraction({ type: 'pointerenter', event })) {
            return;
        }

        if (event.pointerType === 'touch' || !this.openOnHover() || this.isDisabled()) {
            return;
        }

        this.clearCloseTimer();
        this.clearOpenTimer();
        this.lastPointer = { x: event.clientX, y: event.clientY };

        if (this.rootContext.isOpen()) return;

        const delay = this.delay() ?? 100;
        if (delay <= 0) {
            this.openedByHover = true;
            this.rootContext.show('popup', 'trigger-hover', event);
            return;
        }

        this.openTimer = setTimeout(() => {
            this.openTimer = undefined;
            this.openedByHover = true;
            this.rootContext.show('popup', 'trigger-hover', event);
        }, delay);
    }

    protected handlePointerLeave(event: PointerEvent): void {
        this.pressed.set(false);

        if (event.pointerType === 'touch' || !this.openOnHover()) {
            return;
        }

        this.clearOpenTimer();
        this.lastPointer = { x: event.clientX, y: event.clientY };
    }

    protected handlePointerMove(event: PointerEvent): void {
        if (event.pointerType !== 'touch' && this.openOnHover()) {
            this.lastPointer = { x: event.clientX, y: event.clientY };
        }
    }

    private scheduleClose(event?: MouseEvent): void {
        this.clearCloseTimer();
        const closeDelay = this.closeDelay() ?? 0;
        this.closeTimer = setTimeout(() => {
            this.closeTimer = undefined;
            this.rootContext.close('trigger-hover', event);
        }, closeDelay);
    }

    private clearOpenTimer(): void {
        clearTimeout(this.openTimer);
        this.openTimer = undefined;
    }

    private clearCloseTimer(): void {
        clearTimeout(this.closeTimer);
        this.closeTimer = undefined;
    }

    private armMouseUpGuard(trigger: HTMLElement): void {
        this.rootContext.setAllowMouseUpTrigger(false);
        this.allowMouseUpTriggerTimer = setTimeout(() => {
            this.allowMouseUpTriggerTimer = undefined;
            this.rootContext.setAllowMouseUpTrigger(true);
        }, 200);

        trigger.ownerDocument.addEventListener('mouseup', this.handleDocumentMouseUp, { once: true });
    }

    private clearMouseUpGuard(): void {
        clearTimeout(this.allowMouseUpTriggerTimer);
        this.allowMouseUpTriggerTimer = undefined;
        this.rootContext.setAllowMouseUpTrigger(false);
        this.elementRef.nativeElement.ownerDocument.removeEventListener('mouseup', this.handleDocumentMouseUp);
    }

    private restoreKeyboardPopupFocus(attempt = 0): void {
        const maxAttempts = 3;
        const ownerDocument = this.elementRef.nativeElement.ownerDocument;

        const run = () => {
            if (!this.rootContext.isOpen()) {
                return;
            }

            const popup = this.rootContext.popupElement();
            const activeElement = ownerDocument.activeElement;

            if (!popup || getFocusableMenuItems(popup).length === 0) {
                if (attempt < maxAttempts) {
                    this.restoreKeyboardPopupFocus(attempt + 1);
                }
                return;
            }

            if (activeElement && popup.contains(activeElement)) {
                return;
            }

            const firstItem = getFocusableMenuItems(popup)[0];
            (firstItem ?? popup).focus({ preventScroll: true });
        };

        if (this.isBrowser) {
            requestAnimationFrame(run);
        } else {
            setTimeout(run);
        }
    }
}
