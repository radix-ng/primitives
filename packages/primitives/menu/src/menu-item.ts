import { booleanAttribute, computed, Directive, ElementRef, inject, input, output, signal } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectRdxMenuRootContext } from './menu-root';

/**
 * An individual menu item.
 */
@Directive({
    selector: '[rdxMenuItem]',
    exportAs: 'rdxMenuItem',
    host: {
        role: 'menuitem',
        tabindex: '-1',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.aria-disabled]': 'disabled() ? true : undefined',
        '[attr.data-highlighted]': 'highlighted() ? "" : undefined',
        '[attr.data-label]': 'label() ?? undefined',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerleave)': 'onPointerLeave($event)',
        '(click)': 'onItemClick()',
        '(keydown.enter)': 'onActivate($event)',
        '(keydown.space)': 'onActivate($event)'
    }
})
export class RdxMenuItem {
    private readonly rootContext = injectRdxMenuRootContext(true);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly isFocused = signal(false);

    /** Whether this item is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether selecting this item closes the menu. */
    readonly closeOnClick = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** Explicit typeahead label. When set, overrides textContent for character search. */
    readonly label = input<string | undefined>(undefined);

    /** Emits when the item is selected. */
    readonly onSelect = output<void>();

    protected readonly highlighted = computed(() => this.isFocused());

    onFocus(): void {
        if (!this.disabled()) {
            this.isFocused.set(true);
        }
    }

    onBlur(): void {
        this.isFocused.set(false);
    }

    onPointerMove(event: PointerEvent): void {
        if (event.defaultPrevented || event.pointerType !== 'mouse' || this.disabled()) {
            return;
        }
        if (this.rootContext && !this.rootContext.highlightItemOnHover()) {
            return;
        }
        if (document.activeElement !== this.elementRef.nativeElement) {
            this.elementRef.nativeElement.focus({ preventScroll: true });
        }
    }

    onPointerLeave(event: PointerEvent): void {
        if (event.pointerType !== 'mouse') {
            return;
        }
        // Clear highlight when the pointer leaves: move focus back to the popup. A subsequent
        // pointermove on a sibling item re-focuses it, so moving between items still works.
        if (document.activeElement === this.elementRef.nativeElement) {
            this.elementRef.nativeElement.closest<HTMLElement>('[rdxMenuPopup]')?.focus({ preventScroll: true });
        }
    }

    onItemClick(): void {
        if (this.disabled()) return;
        this.onSelect.emit();
        if (this.closeOnClick()) this.rootContext?.close();
    }

    protected onActivate(event: Event): void {
        if (this.disabled()) return;
        event.preventDefault();
        this.onSelect.emit();
        if (this.closeOnClick()) this.rootContext?.close();
    }
}
