import {
    booleanAttribute,
    ComponentRef,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    OnDestroy,
    OnInit,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, ENTER, SPACE, TAB } from '@radix-ng/primitives/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import {
    RdxNavigationMenuAriaOwnsComponent,
    RdxNavigationMenuFocusProxyComponent
} from './navigation-menu-a11y.component';
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { RdxNavigationMenuListDirective } from './navigation-menu-list.directive';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { RdxNavigationMenuFocusableOption } from './navigation-menu.types';
import { getTabbableCandidates, makeContentId, makeTriggerId } from './utils';

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
        '[attr.aria-haspopup]': '"menu"',
        '(pointerenter)': 'onPointerEnter()',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerleave)': 'onPointerLeave($event)',
        '(click)': 'onClick()',
        '(keydown)': 'onKeydown($event)',
        type: 'button'
    },
    providers: [{ provide: RdxNavigationMenuFocusableOption, useExisting: RdxNavigationMenuTriggerDirective }]
})
export class RdxNavigationMenuTriggerDirective extends RdxNavigationMenuFocusableOption implements OnInit, OnDestroy {
    private readonly context = injectNavigationMenu();
    private readonly item = inject(RdxNavigationMenuItemDirective);
    private readonly list = inject(RdxNavigationMenuListDirective);
    private readonly rovingFocusItem = inject(RdxRovingFocusItemDirective, { self: true });
    private readonly elementRef = inject(ElementRef);
    private readonly viewContainerRef = inject(ViewContainerRef);

    readonly disabled = input(false, { transform: booleanAttribute });
    readonly openOnHover = input(true, { transform: booleanAttribute });

    readonly triggerId = makeTriggerId(this.context.baseId, this.item.value());
    readonly contentId = makeContentId(this.context.baseId, this.item.value());
    readonly open = computed(() => {
        return this.item.value() === this.context.value();
    });

    private focusProxyRef: ComponentRef<RdxNavigationMenuFocusProxyComponent> | null = null;
    private ariaOwnsRef: ComponentRef<RdxNavigationMenuAriaOwnsComponent> | null = null;

    private hasPointerMoveOpened = false;
    private wasClickClose = false;

    constructor() {
        super();

        effect(() => {
            this.rovingFocusItem.focusable = !this.disabled();
        });

        effect(() => {
            const isOpen = this.open();

            untracked(() => {
                // handle focus proxy and aria-owns when open state changes
                if (isOpen) {
                    this.createAccessibilityComponents();
                } else {
                    this.removeAccessibilityComponents();

                    if (!this.item.wasEscapeCloseRef()) {
                        this.item.onRootContentClose();
                    }

                    this.hasPointerMoveOpened = false;
                }
            });
        });
    }

    ngOnInit() {
        this.item.triggerRef.set(this.elementRef.nativeElement);

        // configure the static part of the roving focus item directive instance
        this.rovingFocusItem.tabStopId = this.item.value();
    }

    ngOnDestroy() {
        this.removeAccessibilityComponents();
    }

    override focus() {
        this.elementRef.nativeElement.focus();
    }

    private createAccessibilityComponents(): void {
        if (this.focusProxyRef || this.ariaOwnsRef) {
            return;
        }

        // create focus proxy component
        this.focusProxyRef = this.viewContainerRef.createComponent(RdxNavigationMenuFocusProxyComponent);
        this.focusProxyRef.instance.triggerElement = this.elementRef.nativeElement;
        this.focusProxyRef.instance.contentElement = this.item.contentRef();
        this.focusProxyRef.instance.proxyFocus.subscribe((direction: 'start' | 'end') => {
            this.item.onFocusProxyEnter(direction);
        });

        // store reference in item directive
        this.item.focusProxyRef.set(this.focusProxyRef.location.nativeElement);

        // only add aria-owns component if using viewport
        if (isRootNavigationMenu(this.context) && this.context.viewport && this.context.viewport()) {
            this.ariaOwnsRef = this.viewContainerRef.createComponent(RdxNavigationMenuAriaOwnsComponent);
            this.ariaOwnsRef.instance.contentId = this.contentId;
        }
    }

    private removeAccessibilityComponents(): void {
        if (this.focusProxyRef) {
            this.focusProxyRef.destroy();
            this.focusProxyRef = null;
            this.item.focusProxyRef.set(null);
        }

        if (this.ariaOwnsRef) {
            this.ariaOwnsRef.destroy();
            this.ariaOwnsRef = null;
        }
    }

    onPointerEnter(): void {
        // ignore if disabled or not the root menu
        if (this.disabled() || !isRootNavigationMenu(this.context)) return;

        this.wasClickClose = false; // Reset click close flag on enter
        this.item.wasEscapeCloseRef.set(false); // Reset escape flag
        this.context.setTriggerPointerState?.(true); // Update context state

        // if the menu isn't already open for this item, trigger the enter logic
        if (!this.open()) {
            if (this.openOnHover() || this.context.value() !== '') {
                this.context.onTriggerEnter?.(this.item.value());
            }
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

        // manually set the `KeyManager` active item to this trigger
        this.list.setActiveItem(this.item);

        if (this.context.onItemSelect) {
            this.context.onItemSelect(this.item.value());
            // track if this click action resulted in closing the menu
            this.wasClickClose = !this.open();
            // reset escape flag if menu was opened by click
            if (this.open()) {
                this.item.wasEscapeCloseRef.set(false);
            }
        }
    }

    onKeydown(event: KeyboardEvent): void {
        if (this.disabled()) return;

        if (event.key === ENTER || event.key === SPACE) {
            event.preventDefault(); // prevent default button behavior
            this.onClick();

            // if menu was opened by this keypress, move focus into the content
            if (this.open()) {
                // defer focus slightly to ensure content is ready
                setTimeout(() => this.item.onEntryKeyDown(), 0);
            }
            return;
        }

        const isHorizontal = this.context.orientation === 'horizontal';
        const isRTL = this.context.dir === 'rtl';

        // handle `ArrowDown` specifically for viewport navigation
        if (event.key === ARROW_DOWN || event.key === TAB) {
            if (event.key === ARROW_DOWN) {
                event.preventDefault();
            }

            // if the menu is open, focus into the content
            if (this.open()) {
                if (event.key === TAB) {
                    // needed to ensure that the `keyManager` on the list directive does not activate
                    // any focus updates, shifting focus to the subsequent focusable list item
                    event.stopImmediatePropagation();
                }

                // direct focus handling for viewport case
                if (isRootNavigationMenu(this.context) && this.context.viewport && this.context.viewport()) {
                    // get the viewport element
                    const viewport = this.context.viewport();
                    if (viewport) {
                        // find all tabbable elements in the viewport
                        const tabbables = getTabbableCandidates(viewport);
                        if (tabbables.length > 0) {
                            // focus the first tabbable element directly
                            setTimeout(() => {
                                tabbables[0].focus();
                            }, 0);
                            return;
                        }
                    }
                }

                // fallback to the standard entry key down approach
                setTimeout(() => this.item.onEntryKeyDown(), 0);
                return;
            }

            // if not open but in horizontal orientation, emulate right key navigation
            if (isHorizontal) {
                const nextEvent = new KeyboardEvent('keydown', {
                    key: isRTL ? ARROW_LEFT : ARROW_RIGHT,
                    bubbles: true
                });
                this.elementRef.nativeElement.dispatchEvent(nextEvent);
                return;
            }
        }

        // handle ArrowUp in horizontal orientation
        if (isHorizontal && event.key === ARROW_UP) {
            event.preventDefault();

            // emulate a left key press to move to the previous item
            const nextEvent = new KeyboardEvent('keydown', {
                key: isRTL ? ARROW_RIGHT : ARROW_LEFT,
                bubbles: true
            });
            this.elementRef.nativeElement.dispatchEvent(nextEvent);
            return;
        }

        // handle vertical navigation and entry into content
        const verticalEntryKey = isRTL ? ARROW_LEFT : ARROW_RIGHT;
        const entryKey = isHorizontal ? ARROW_DOWN : verticalEntryKey;

        if (this.item.contentRef() && event.key === entryKey && event.key !== ARROW_DOWN) {
            // Skip if it's ArrowDown as we already handled it above
            event.preventDefault();

            if (!this.open()) {
                // if closed, open the menu first
                this.context.onItemSelect?.(this.item.value());
                // defer focus movement into content until after state update and render
                setTimeout(() => this.item.onEntryKeyDown(), 0);
            } else {
                // if already open, just move focus into the content
                this.item.onEntryKeyDown();
            }
            return;
        }
    }
}
