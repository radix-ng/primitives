import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input, untracked } from '@angular/core';
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { injectNavigationMenu } from './navigation-menu.token';
import { makeContentId, makeTriggerId } from './utils';

@Directive({
    selector: '[rdxNavigationMenuTrigger]',
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
        '(keydown)': 'onKeyDown($event)',
        type: 'button',
        role: 'button'
    }
})
export class RdxNavigationMenuTriggerDirective {
    private readonly context = injectNavigationMenu();
    private readonly item = inject(RdxNavigationMenuItemDirective);
    readonly elementRef = inject(ElementRef);

    readonly disabled = input(false, { transform: booleanAttribute });

    readonly triggerId = makeTriggerId(this.context.baseId, this.item.value());
    readonly contentId = makeContentId(this.context.baseId, this.item.value());

    private hasPointerMoveOpened = false;
    private wasClickClose = false;

    readonly open = computed(() => {
        return this.item.value() === this.context.value();
    });

    constructor() {
        // register with item
        this.item.triggerRef.set(this.elementRef.nativeElement);

        // track when open state changes
        effect(() => {
            // this effect runs whenever open state changes
            const isOpen = this.open();
            untracked(() => {
                // reset state variables when closing
                if (!isOpen) {
                    this.hasPointerMoveOpened = false;
                }
            });
        });
    }

    onPointerEnter() {
        if (!this.disabled()) {
            // update pointer tracking state
            if (this.context.setTriggerPointerState) {
                this.context.setTriggerPointerState(true);
            }
            // reset state flags
            this.wasClickClose = false;
            this.item.wasEscapeCloseRef.set(false);
        }
    }

    onPointerMove(event: PointerEvent) {
        // only handle mouse events
        if (
            event.pointerType !== 'mouse' ||
            this.disabled() ||
            this.wasClickClose ||
            this.item.wasEscapeCloseRef() ||
            this.hasPointerMoveOpened
        ) {
            return;
        }

        // trigger menu open
        if (this.context.onTriggerEnter) {
            this.context.onTriggerEnter(this.item.value());
            this.hasPointerMoveOpened = true;
        }
    }

    onPointerLeave(event: PointerEvent) {
        // Only handle mouse events
        if (event.pointerType !== 'mouse' || this.disabled()) {
            return;
        }

        // update pointer tracking state
        if (this.context.setTriggerPointerState) {
            this.context.setTriggerPointerState(false);
        }

        // reset user dismissal state when mouse fully leaves trigger
        if (this.context.resetUserDismissed) {
            this.context.resetUserDismissed();
        }

        // trigger menu close
        if (this.context.onTriggerLeave) {
            this.context.onTriggerLeave();
            this.hasPointerMoveOpened = false;
        }
    }

    onClick() {
        // toggle menu on click
        if (this.context.onItemSelect) {
            this.context.onItemSelect(this.item.value());
            this.wasClickClose = this.open();
        }
    }

    onKeyDown(event: KeyboardEvent) {
        // handle keyboard navigation
        const verticalEntryKey = this.context.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
        const entryKey = {
            horizontal: 'ArrowDown',
            vertical: verticalEntryKey
        }[this.context.orientation];

        // focus into content when appropriate arrow key is pressed
        if (this.open() && event.key === entryKey) {
            this.item.onEntryKeyDown();
            event.preventDefault();
        }
    }
}
