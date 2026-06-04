import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, ElementRef, inject, input, output, signal } from '@angular/core';
import { injectRdxMenuRootContext } from './menu-root';

/**
 * A menu item that renders as a link.
 */
@Directive({
    selector: 'a[rdxMenuLinkItem]',
    exportAs: 'rdxMenuLinkItem',
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
        '(click)': 'onItemClick($event)',
        '(keydown.enter)': 'onActivate($event)'
    }
})
export class RdxMenuLinkItem {
    private readonly rootContext = injectRdxMenuRootContext(true);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly isFocused = signal(false);

    /** Whether this item is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether selecting this item closes the menu. Defaults to false — links navigate by default. */
    readonly closeOnClick = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

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
        if (document.activeElement === this.elementRef.nativeElement) {
            this.elementRef.nativeElement.closest<HTMLElement>('[rdxMenuPopup]')?.focus({ preventScroll: true });
        }
    }

    onItemClick(event: MouseEvent): void {
        if (this.disabled()) {
            event.preventDefault();
            return;
        }
        this.onSelect.emit();
        if (this.closeOnClick()) this.rootContext?.close();
    }

    protected onActivate(event: Event): void {
        if (this.disabled()) {
            event.preventDefault();
            return;
        }
        this.onSelect.emit();
        if (this.closeOnClick()) this.rootContext?.close();
    }
}
