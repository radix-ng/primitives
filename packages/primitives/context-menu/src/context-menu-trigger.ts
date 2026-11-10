import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    numberAttribute
} from '@angular/core';
import { BooleanInput, NumberInput } from '@radix-ng/primitives/core';
import { findMenuOwnerId, RdxMenuRoot } from '@radix-ng/primitives/menu';
import { injectRdxContextMenuRootContext } from './context-menu-root';

/**
 * An area that opens the context menu on right click (or a touch long-press).
 *
 * Apply it to the element that should respond to the context-menu gesture; the popup is positioned
 * at the pointer, not against this element.
 */
@Directive({
    selector: '[rdxContextMenuTrigger]',
    exportAs: 'rdxContextMenuTrigger',
    host: {
        '[attr.data-popup-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-pressed]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-disabled]': 'effectiveDisabled() ? "" : undefined',
        '(contextmenu)': 'onContextMenu($event)',
        '(pointerdown)': 'onPointerDown($event)',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerup)': 'cancelLongPress()',
        '(pointercancel)': 'cancelLongPress()',
        '(pointerleave)': 'cancelLongPress()'
    }
})
export class RdxContextMenuTrigger {
    protected readonly rootContext = injectRdxContextMenuRootContext();
    private readonly menuRoot = inject(RdxMenuRoot);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /** Whether the trigger is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    protected readonly effectiveDisabled = computed(() => this.disabled() || this.rootContext.disabled());

    /** How long (ms) a touch must be held before the menu opens. */
    readonly longPressDelay = input<number, NumberInput>(500, { transform: numberAttribute });

    private longPressTimer: ReturnType<typeof setTimeout> | undefined;
    private allowMouseUpTimer: ReturnType<typeof setTimeout> | undefined;
    private longPressOrigin: { x: number; y: number } | undefined;
    private allowMouseUp = false;
    private readonly handleDocumentMouseUp = (event: MouseEvent): void => {
        this.clearContextMenuMouseUpGuard();
        // The gesture is over: whatever happens next is a fresh interaction, so no later release may
        // activate an item.
        this.menuRoot.setAllowMouseUpTrigger(false);

        if (!this.allowMouseUp) {
            return;
        }

        this.allowMouseUp = false;
        const target = event.target as Node | null;

        // Anything belonging to this menu chain — the positioner around the popup, and a submenu
        // portaled elsewhere in the DOM — is not an outside release (Base UI `findRootOwnerId`).
        if (target && findMenuOwnerId(target) === this.menuRoot.ownerId()) {
            return;
        }

        this.rootContext.close('cancel-open', event);
    };

    constructor() {
        const ownerDocument = this.elementRef.nativeElement.ownerDocument;

        // While the menu is open, a second right-click over the trigger or the popup must not surface the
        // native browser context menu (Base UI registers the same document-level suppressor).
        const suppressNativeContextMenu = (event: MouseEvent): void => {
            if (!this.rootContext.isOpen()) {
                return;
            }
            const target = event.target as Node | null;
            const popup = this.menuRoot.popupElement();
            if (target && (this.elementRef.nativeElement.contains(target) || popup?.contains(target))) {
                event.preventDefault();
            }
        };
        ownerDocument.addEventListener('contextmenu', suppressNativeContextMenu);

        inject(DestroyRef).onDestroy(() => {
            ownerDocument.removeEventListener('contextmenu', suppressNativeContextMenu);
            this.cancelLongPress();
            this.clearContextMenuMouseUpGuard();
        });
    }

    protected onContextMenu(event: MouseEvent): void {
        if (this.effectiveDisabled()) {
            return;
        }

        // Suppress the native context menu and open ours at the pointer.
        event.preventDefault();
        this.cancelLongPress();

        // Where the gesture started, and permission for an item to act on the release that ends it —
        // both consumed by the items' `mouseup` handling (Base UI `ContextMenuTrigger`).
        this.menuRoot.setInitialCursorPoint({ x: event.clientX, y: event.clientY });
        this.menuRoot.setAllowMouseUpTrigger(true);
        // A right-click `contextmenu` event has no `pointerType`, so this records a non-touch open.
        // Native keyboard context-menu events use the same popup focus policy as Base UI. Elapsed
        // time since a pointerdown cannot reliably identify their origin.
        this.rootContext.openAt(event.clientX, event.clientY, 'popup', event);
        this.armContextMenuMouseUpGuard(this.elementRef.nativeElement);
    }

    protected onPointerDown(event: PointerEvent): void {
        if (this.effectiveDisabled() || event.pointerType !== 'touch') {
            return;
        }

        // A second finger cancels the first finger's pending long-press as well.
        this.cancelLongPress();
        if (event.isPrimary === false) return;
        const { clientX, clientY } = event;
        this.longPressOrigin = { x: clientX, y: clientY };
        this.longPressTimer = setTimeout(() => {
            this.longPressTimer = undefined;
            // Pass the touch pointer event so the menu records a touch open (ADR 0016 §3).
            this.rootContext.openAt(clientX, clientY, 'popup', event);
        }, this.longPressDelay());
    }

    protected onPointerMove(event: PointerEvent): void {
        // A finger that drifts more than ~10px is a scroll/drag, not a long-press.
        if (!this.longPressOrigin) {
            return;
        }

        const dx = event.clientX - this.longPressOrigin.x;
        const dy = event.clientY - this.longPressOrigin.y;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
            this.cancelLongPress();
        }
    }

    protected cancelLongPress(): void {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = undefined;
        this.longPressOrigin = undefined;
    }

    private armContextMenuMouseUpGuard(trigger: HTMLElement): void {
        this.clearContextMenuMouseUpGuard();
        this.allowMouseUp = false;
        this.allowMouseUpTimer = setTimeout(() => {
            this.allowMouseUpTimer = undefined;
            this.allowMouseUp = true;
        }, 500);

        trigger.ownerDocument.addEventListener('mouseup', this.handleDocumentMouseUp, { once: true });
    }

    private clearContextMenuMouseUpGuard(): void {
        clearTimeout(this.allowMouseUpTimer);
        this.allowMouseUpTimer = undefined;
        this.elementRef.nativeElement.ownerDocument.removeEventListener('mouseup', this.handleDocumentMouseUp);
    }
}
