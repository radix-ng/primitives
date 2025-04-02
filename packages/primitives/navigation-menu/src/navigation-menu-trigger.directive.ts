import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    OnInit,
    untracked
} from '@angular/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { makeContentId, makeTriggerId } from './utils';

@Directive({
    selector: '[rdxNavigationMenuTrigger]',
    hostDirectives: [RdxRovingFocusItemDirective],
    host: {
        '[id]': 'triggerId',
        '[attr.data-state]': 'open() ? "open" : "closed"',
        '[attr.data-orientation]': 'context.orientation',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[disabled]': 'disabled() ? true : null',
        '[attr.aria-expanded]': 'open()',
        '[attr.aria-controls]': 'contentId',
        '(pointerenter)': 'onPointerEnter()',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerleave)': 'onPointerLeave($event)',
        '(click)': 'onClick()',
        '(keydown)': 'onKeydown($event)',
        type: 'button'
    }
})
export class RdxNavigationMenuTriggerDirective implements OnInit {
    private readonly context = injectNavigationMenu();
    private readonly item = inject(RdxNavigationMenuItemDirective);
    private readonly rovingFocusItem = inject(RdxRovingFocusItemDirective, { self: true });

    readonly elementRef = inject(ElementRef);

    readonly disabled = input(false, { transform: booleanAttribute });

    readonly triggerId = makeTriggerId(this.context.baseId, this.item.value());
    readonly contentId = makeContentId(this.context.baseId, this.item.value());
    readonly open = computed(() => {
        return this.item.value() === this.context.value();
    });

    private hasPointerMoveOpened = false;
    private wasClickClose = false;

    constructor() {
        // --- Effect for Roving Focus Item Focusable State ---
        // This runs within the constructor's injection context
        effect(() => {
            // Update the focusable state of the RovingFocusItem directive
            // whenever the disabled input signal changes.
            this.rovingFocusItem.focusable = !this.disabled();
        });

        // --- Effect for Internal State Management ---
        // This also runs within the constructor's injection context
        effect(() => {
            const isOpen = this.open();
            untracked(() => {
                if (!isOpen) {
                    this.hasPointerMoveOpened = false;
                    if (!this.item.wasEscapeCloseRef()) {
                        this.item.onRootContentClose();
                    }
                }
            });
        });
    }

    ngOnInit() {
        // Register this trigger instance with its parent item directive
        this.item.triggerRef.set(this.elementRef.nativeElement);

        // Configure the static part of the roving focus item directive instance
        this.rovingFocusItem.tabStopId = this.item.value();
        // The effect for 'focusable' is now in the constructor
    }

    onPointerEnter(): void {
        // ignore if disabled or not the root menu (hover logic primarily for root)
        if (this.disabled() || !isRootNavigationMenu(this.context)) return;

        this.wasClickClose = false; // Reset click close flag on enter
        this.item.wasEscapeCloseRef.set(false); // Reset escape flag
        this.context.setTriggerPointerState?.(true); // Update context state

        // if the menu isn't already open for this item, trigger the enter logic (handles delays)
        if (!this.open()) {
            this.context.onTriggerEnter?.(this.item.value());
        }
    }

    onPointerMove(event: PointerEvent): void {
        // ignore if not a mouse event, disabled, closed by click/escape, or already opened by this move
        if (
            event.pointerType !== 'mouse' ||
            this.disabled() ||
            this.wasClickClose ||
            this.item.wasEscapeCloseRef() ||
            this.hasPointerMoveOpened ||
            !isRootNavigationMenu(this.context)
        ) {
            return;
        }
        // trigger enter logic (handles delays) and mark that this move initiated an open attempt
        this.context.onTriggerEnter?.(this.item.value());
        this.hasPointerMoveOpened = true;
    }

    onPointerLeave(event: PointerEvent): void {
        // ignore if not a mouse event or disabled
        if (event.pointerType !== 'mouse' || this.disabled() || !isRootNavigationMenu(this.context)) {
            return;
        }

        this.context.setTriggerPointerState?.(false); // Update context state
        this.context.onTriggerLeave?.(); // Trigger leave logic (handles delays)
        this.hasPointerMoveOpened = false; // Reset flag

        // reset user dismissal flag if pointer leaves the whole system (trigger + content)
        if (this.context.resetUserDismissed) {
            // relay slightly to allow pointer movement to content area without resetting dismissal state
            setTimeout(() => {
                if (!this.context.isPointerInSystem?.()) {
                    this.context.resetUserDismissed?.();
                }
            }, 50); // small delay for tolerance
        }
    }

    onClick(): void {
        if (this.disabled()) return;

        // Use context method to handle item selection (toggles open state)
        if (this.context.onItemSelect) {
            this.context.onItemSelect(this.item.value());
            // Track if this click action resulted in closing the menu
            this.wasClickClose = !this.open();
            // Reset escape flag if menu was opened by click
            if (this.open()) {
                this.item.wasEscapeCloseRef.set(false);
            }
        }
    }

    onKeydown(event: KeyboardEvent): void {
        if (this.disabled()) return;

        // --- Enter or Space: Toggle the submenu ---
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault(); // Prevent default button behavior (e.g., scrolling on space)
            this.onClick(); // Reuse click logic for toggling

            // If menu was opened by this keypress, move focus into the content
            if (this.open()) {
                // Defer focus slightly to ensure content is ready
                setTimeout(() => this.item.onEntryKeyDown(), 0);
            }
            return; // Stop processing here
        }

        // --- Arrow keys for entering content ---
        // Determine the correct arrow key based on orientation and text direction
        const isHorizontal = this.context.orientation === 'horizontal';
        const isRTL = this.context.dir === 'rtl';
        const verticalEntryKey = isRTL ? 'ArrowLeft' : 'ArrowRight'; // Arrow key for vertical menus
        const entryKey = isHorizontal ? 'ArrowDown' : verticalEntryKey; // Entry key depends on orientation

        // Check if the pressed key matches the entry key and if content exists
        if (this.item.contentRef() && event.key === entryKey) {
            event.preventDefault(); // Prevent default arrow key behavior (e.g., page scrolling)

            if (!this.open()) {
                // If closed, open the menu first
                this.context.onItemSelect?.(this.item.value());
                // Defer focus movement into content until after state update and render
                setTimeout(() => this.item.onEntryKeyDown(), 0);
            } else {
                // If already open, just move focus into the content
                this.item.onEntryKeyDown();
            }
            return; // Stop processing here
        }

        // --- Let other keys bubble up ---
        // Arrow keys for navigating *between* triggers (ArrowLeft/Right in horizontal, ArrowUp/Down in vertical)
        // and Home/End keys are *not* handled here. They will bubble up to the
        // RdxRovingFocusGroupDirective on the parent RdxNavigationMenuList.
    }
}
