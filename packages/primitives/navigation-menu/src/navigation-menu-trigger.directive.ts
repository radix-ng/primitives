import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    HostListener,
    inject,
    Input,
    untracked
} from '@angular/core';
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { injectNavigationMenu } from './navigation-menu.token';
import { makeContentId, makeTriggerId } from './utils';

@Directive({
    selector: '[rdxNavigationMenuTrigger]',
    standalone: true,
    host: {
        '[id]': 'triggerId',
        '[attr.data-state]': 'open() ? "open" : "closed"',
        '[attr.data-orientation]': 'context.orientation',
        '[attr.data-disabled]': 'disabled ? "" : undefined',
        '[disabled]': 'disabled ? true : null',
        '[attr.aria-expanded]': 'open()',
        '[attr.aria-controls]': 'contentId',
        type: 'button',
        role: 'button'
    }
})
export class RdxNavigationMenuTriggerDirective {
    private readonly context = injectNavigationMenu();
    private readonly item = inject(RdxNavigationMenuItemDirective);
    readonly elementRef = inject(ElementRef);

    @Input({ transform: booleanAttribute }) disabled = false;

    readonly triggerId = makeTriggerId(this.context.baseId, this.item.value);
    readonly contentId = makeContentId(this.context.baseId, this.item.value);

    private hasPointerMoveOpened = false;
    private wasClickClose = false;

    // Computed state based on context value and item value
    readonly open = computed(() => {
        return this.item.value === this.context.value();
    });

    constructor() {
        // Register with item
        this.item.triggerRef.set(this.elementRef.nativeElement);

        // Track when open state changes
        effect(() => {
            // This effect runs whenever open state changes
            const isOpen = this.open();
            untracked(() => {
                // Reset state variables when closing
                if (!isOpen) {
                    this.hasPointerMoveOpened = false;
                }
            });
        });
    }

    @HostListener('pointerenter')
    onPointerEnter() {
        if (!this.disabled) {
            // Update pointer tracking state
            if (this.context.setTriggerPointerState) {
                this.context.setTriggerPointerState(true);
            }
            // Reset state flags
            this.wasClickClose = false;
            this.item.wasEscapeCloseRef.set(false);
        }
    }

    @HostListener('pointermove', ['$event'])
    onPointerMove(event: PointerEvent) {
        // Only handle mouse events
        if (
            event.pointerType !== 'mouse' ||
            this.disabled ||
            this.wasClickClose ||
            this.item.wasEscapeCloseRef() ||
            this.hasPointerMoveOpened
        ) {
            return;
        }

        // Trigger menu open
        if (this.context.onTriggerEnter) {
            this.context.onTriggerEnter(this.item.value);
            this.hasPointerMoveOpened = true;
        }
    }

    @HostListener('pointerleave', ['$event'])
    onPointerLeave(event: PointerEvent) {
        // Only handle mouse events
        if (event.pointerType !== 'mouse' || this.disabled) {
            return;
        }

        // Update pointer tracking state
        if (this.context.setTriggerPointerState) {
            this.context.setTriggerPointerState(false);
        }

        // Reset user dismissal state when mouse fully leaves trigger
        if (this.context.resetUserDismissed) {
            this.context.resetUserDismissed();
        }

        // Trigger menu close
        if (this.context.onTriggerLeave) {
            this.context.onTriggerLeave();
            this.hasPointerMoveOpened = false;
        }
    }

    @HostListener('click')
    onClick() {
        // Toggle menu on click
        if (this.context.onItemSelect) {
            this.context.onItemSelect(this.item.value);
            this.wasClickClose = this.open();
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        // Handle keyboard navigation
        const verticalEntryKey = this.context.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
        const entryKey = {
            horizontal: 'ArrowDown',
            vertical: verticalEntryKey
        }[this.context.orientation];

        // Focus into content when appropriate arrow key is pressed
        if (this.open() && event.key === entryKey) {
            this.item.onEntryKeyDown();
            event.preventDefault();
        }
    }
}
