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
    PLATFORM_ID
} from '@angular/core';
import { BooleanInput, NumberInput } from '@radix-ng/primitives/core';
import { RdxDismissableLayersContextToken } from '@radix-ng/primitives/dismissable-layer';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { injectRdxMenuRootContext } from './menu-root';
import { applyPointerTunnel, createSafePolygonHandler, hasOpenChildSubmenu, MenuSide } from './menu-safe-polygon';

const numberOrUndefined = (value: NumberInput | undefined) => (value == null ? undefined : numberAttribute(value));

/**
 * A button that opens the menu.
 */
@Directive({
    selector: '[rdxMenuTrigger]',
    exportAs: 'rdxMenuTrigger',
    hostDirectives: [RdxPopperAnchor],
    host: {
        '[attr.type]': 'nativeButtonState() ? "button" : undefined',
        '[attr.role]':
            'rootContext.hasTriggerInteractionHandler() ? "menuitem" : nativeButtonState() ? undefined : "button"',
        '[attr.tabindex]': 'rootContext.hasTriggerInteractionHandler() ? "-1" : undefined',
        '[attr.aria-haspopup]': '"menu"',
        '[attr.aria-expanded]': 'rootContext.isOpen()',
        '[attr.aria-disabled]': 'isDisabled() ? true : undefined',
        '[attr.disabled]': 'nativeButtonState() && isDisabled() ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-popup-open]': 'rootContext.isOpen() ? "" : undefined',
        '[style.pointer-events]': 'rootContext.isOpen() && rootContext.modal() ? "auto" : undefined',
        '(click)': 'handleClick()',
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
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly dismissableLayersContext = inject(RdxDismissableLayersContextToken);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private openTimer: ReturnType<typeof setTimeout> | undefined;
    private closeTimer: ReturnType<typeof setTimeout> | undefined;
    private lastPointer: { x: number; y: number } | null = null;
    private openedByHover = false;

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

    protected readonly isDisabled = computed(() => this.rootContext.disabled() || this.disabled());

    constructor() {
        effect((onCleanup) => {
            const el = this.elementRef.nativeElement;
            const unregister = this.rootContext.registerTrigger(el);
            onCleanup(unregister);
        });

        effect((onCleanup) => {
            const open = this.rootContext.isOpen();
            const popup = this.rootContext.popupElement();

            if (!open) {
                this.openedByHover = false;
                this.lastPointer = null;
                return;
            }

            if (!popup || !this.openedByHover || !this.lastPointer || !this.isBrowser) {
                return;
            }

            const trigger = this.elementRef.nativeElement;
            let removeTunnel: (() => void) | undefined = applyPointerTunnel(document.body, trigger, popup);
            const { handler, dispose } = createSafePolygonHandler({
                reference: trigger,
                floating: popup,
                side: () => (popup.getAttribute('data-side') as MenuSide) ?? 'bottom',
                x: this.lastPointer.x,
                y: this.lastPointer.y,
                onClose: () => this.scheduleClose(),
                cancelClose: () => this.clearCloseTimer(),
                hasOpenChild: () => hasOpenChildSubmenu(trigger, popup),
                onLanded: () => {
                    removeTunnel?.();
                    removeTunnel = undefined;
                }
            });

            document.addEventListener('mousemove', handler);
            onCleanup(() => {
                document.removeEventListener('mousemove', handler);
                dispose();
                removeTunnel?.();
                this.clearCloseTimer();
            });
        });

        // Keep coordinated triggers and the active trigger of a modal menu interactive. Registering
        // them as a dismissable-layer branch prevents pointer/focus interaction on the trigger from
        // dismissing the popup before the trigger's own click can toggle it.
        effect((onCleanup) => {
            if (
                !this.rootContext.hasTriggerInteractionHandler() &&
                !(this.rootContext.isOpen() && this.rootContext.modal())
            ) {
                return;
            }

            const el = this.elementRef.nativeElement;
            this.dismissableLayersContext.branches.update((branches) => [...branches, el]);
            onCleanup(() => {
                this.dismissableLayersContext.branches.update((branches) => branches.filter((b) => b !== el));
            });
        });

        this.destroyRef.onDestroy(() => {
            this.clearOpenTimer();
            this.clearCloseTimer();
        });
    }

    protected handleClick(): void {
        if (this.isDisabled()) {
            return;
        }

        if (this.rootContext.handleTriggerInteraction({ type: 'click' })) {
            return;
        }

        this.openedByHover = false;
        this.rootContext.toggle();
    }

    protected handleArrowDown(event: Event): void {
        if (this.rootContext.handleTriggerInteraction({ type: 'arrowdown', event })) {
            return;
        }

        event.preventDefault();
        if (!this.isDisabled() && !this.rootContext.isOpen()) {
            this.rootContext.show('first');
        }
    }

    protected handleArrowUp(event: Event): void {
        if (this.rootContext.handleTriggerInteraction({ type: 'arrowup', event })) {
            return;
        }

        event.preventDefault();
        if (!this.isDisabled() && !this.rootContext.isOpen()) {
            this.rootContext.show('last');
        }
    }

    protected handleArrowLeft(event: Event): void {
        this.rootContext.handleTriggerInteraction({ type: 'arrowleft', event });
    }

    protected handleArrowRight(event: Event): void {
        this.rootContext.handleTriggerInteraction({ type: 'arrowright', event });
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
        if (this.nativeButtonState()) {
            return;
        }

        event.preventDefault();
        this.handleClick();
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

        const delay = this.delay() ?? 100;
        if (delay <= 0) {
            this.openedByHover = true;
            this.rootContext.show();
            return;
        }

        this.openTimer = setTimeout(() => {
            this.openTimer = undefined;
            this.openedByHover = true;
            this.rootContext.show();
        }, delay);
    }

    protected handlePointerLeave(event: PointerEvent): void {
        if (event.pointerType === 'touch' || !this.openOnHover()) {
            return;
        }

        this.clearOpenTimer();
        this.lastPointer = { x: event.clientX, y: event.clientY };

        if (!this.rootContext.isOpen() || !this.openedByHover) {
            this.scheduleClose();
        }
    }

    protected handlePointerMove(event: PointerEvent): void {
        if (event.pointerType !== 'touch' && this.openOnHover()) {
            this.lastPointer = { x: event.clientX, y: event.clientY };
        }
    }

    private scheduleClose(): void {
        this.clearCloseTimer();
        const closeDelay = this.closeDelay() ?? 0;
        this.closeTimer = setTimeout(() => {
            this.closeTimer = undefined;
            this.rootContext.close();
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
}
