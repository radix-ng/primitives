import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    output,
    signal
} from '@angular/core';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import { BooleanInput, dispatchClickWithModifiers } from '@radix-ng/primitives/core';
import { RdxFloatingFocusManager } from '@radix-ng/primitives/floating-focus-manager';
import { shouldClearMenuHighlight } from './menu-focus';
import { shouldActivateOnMouseUp } from './menu-mouse-up';
import { injectRdxMenuRootContext } from './menu-root';

/**
 * An individual menu item.
 */
@Directive({
    selector: '[rdxMenuItem]',
    exportAs: 'rdxMenuItem',
    hostDirectives: [RdxCompositeListItem],
    host: {
        role: 'menuitem',
        '[attr.tabindex]': 'rootContext?.isOpen() && highlighted() ? 0 : -1',
        '[attr.data-disabled]': 'effectiveDisabled() ? "" : undefined',
        '[attr.aria-disabled]': 'effectiveDisabled() ? true : undefined',
        '[attr.data-highlighted]': 'highlighted() ? "" : undefined',
        '[attr.data-label]': 'label() ?? undefined',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur($event)',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerleave)': 'onPointerLeave($event)',
        '(mouseup)': 'onMouseUp($event)',
        '(click)': 'onItemClick($event)',
        '(keydown.enter)': 'onActivate($event)',
        '(keydown.space)': 'onActivate($event)'
    }
})
export class RdxMenuItem {
    protected readonly rootContext = injectRdxMenuRootContext(true);
    private readonly listItem = inject(RdxCompositeListItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly isFocused = signal(false);
    private readonly focusManager = inject(RdxFloatingFocusManager, { optional: true });

    /** Whether this item is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether selecting this item closes the menu. */
    readonly closeOnClick = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** Explicit typeahead label. When set, overrides textContent for character search. */
    readonly label = input<string | undefined>(undefined);

    /** Emits when the item is selected. */
    readonly onSelect = output<void>();

    protected readonly highlighted = computed(
        () =>
            this.rootContext?.isOpen() !== false &&
            (this.rootContext ? this.rootContext.activeIndex() === this.listItem.index() : this.isFocused())
    );
    protected readonly effectiveDisabled = computed(() => this.disabled() || (this.rootContext?.disabled() ?? false));

    constructor() {
        effect(() => {
            this.listItem.setMetadata({
                type: 'regular-item',
                disabled: this.effectiveDisabled(),
                label: this.label()
            });
        });
    }

    onFocus(): void {
        if (!this.rootContext?.disabled()) {
            this.isFocused.set(true);
        }
        if (!this.focusManager?.isRestoringFocus()) this.setActiveIndex();
    }

    onBlur(event?: FocusEvent): void {
        this.isFocused.set(false);
        if (shouldClearMenuHighlight(event, this.rootContext?.getCoordinatorElements() ?? [])) this.clearActiveIndex();
    }

    onPointerMove(event: PointerEvent): void {
        // WebKit fires zero-delta moves while the list scrolls under a still cursor.
        if (this.rootContext?.isStationaryPointerMove(event)) {
            return;
        }
        if (event.defaultPrevented || event.pointerType !== 'mouse' || this.rootContext?.disabled()) {
            return;
        }
        this.rootContext?.onItemHover(this.elementRef.nativeElement, event);
        if (this.rootContext && !this.rootContext.highlightItemOnHover()) {
            return;
        }
        this.setActiveIndex();
        if (this.elementRef.nativeElement.ownerDocument.activeElement !== this.elementRef.nativeElement) {
            this.elementRef.nativeElement.focus({ preventScroll: true });
        }
    }

    onPointerLeave(event: PointerEvent): void {
        if (event.pointerType !== 'mouse') {
            return;
        }
        // Clear highlight when the pointer leaves: move focus back to the popup. A subsequent
        // pointermove on a sibling item re-focuses it, so moving between items still works.
        if (this.elementRef.nativeElement.ownerDocument.activeElement === this.elementRef.nativeElement) {
            this.isFocused.set(false);
            this.clearActiveIndex();
            this.elementRef.nativeElement.closest<HTMLElement>('[rdxMenuPopup]')?.focus({ preventScroll: true });
        }
    }

    onItemClick(event: MouseEvent): void {
        if (this.effectiveDisabled()) return;
        this.onSelect.emit();
        if (this.closeOnClick()) this.rootContext?.closeEntireMenu('item-press', event);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.effectiveDisabled() || !shouldActivateOnMouseUp(event, this.rootContext)) {
            return;
        }

        this.rootContext!.setAllowMouseUpTrigger(false);
        // A pointer gesture, not a keyboard activation: carry the modifiers over and report
        // `detail: 1` so the menu does not treat the close as instant.
        dispatchClickWithModifiers(this.elementRef.nativeElement, event, { detail: 1 });
    }

    protected onActivate(event: Event): void {
        if (this.effectiveDisabled()) return;
        event.preventDefault();
        this.onSelect.emit();
        if (this.closeOnClick()) this.rootContext?.closeEntireMenu('item-press', event);
    }

    private setActiveIndex(): void {
        if (!this.rootContext || this.rootContext.disabled()) {
            return;
        }

        const index = this.listItem.index();
        if (index !== -1) {
            this.rootContext.setActiveIndex(index);
        }
    }

    private clearActiveIndex(): void {
        if (this.rootContext?.activeIndex() === this.listItem.index()) {
            this.rootContext.setActiveIndex(null);
        }
    }
}
