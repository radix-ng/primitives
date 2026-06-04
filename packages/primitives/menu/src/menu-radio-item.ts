import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    ElementRef,
    inject,
    input,
    output,
    signal,
    Signal
} from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
import { injectRdxMenuRadioGroupContext } from './menu-radio-group';
import { injectRdxMenuRootContext } from './menu-root';
import { getCheckedState } from './menu-utils';

export interface RdxMenuRadioItemContext {
    checked: Signal<boolean>;
}

export const [injectRdxMenuRadioItemContext, provideRdxMenuRadioItemContext] =
    createContext<RdxMenuRadioItemContext>('RdxMenuRadioItemContext');

const radioItemContextFactory = (): RdxMenuRadioItemContext => {
    const instance = inject(RdxMenuRadioItem);
    return {
        checked: instance.checked
    };
};

/**
 * A radio item within a menu radio group.
 */
@Directive({
    selector: '[rdxMenuRadioItem]',
    exportAs: 'rdxMenuRadioItem',
    providers: [provideRdxMenuRadioItemContext(radioItemContextFactory)],
    host: {
        role: 'menuitemradio',
        tabindex: '-1',
        '[attr.aria-checked]': 'checked()',
        '[attr.data-state]': 'getCheckedState(checked())',
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
export class RdxMenuRadioItem {
    private readonly rootContext = injectRdxMenuRootContext(true);
    private readonly radioGroupContext = injectRdxMenuRadioGroupContext()!;
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly isFocused = signal(false);

    /** The value of this radio item. */
    readonly value = input.required<string>();

    /** Whether this item is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether selecting closes the menu. Defaults to false — radio items stay open. */
    readonly closeOnClick = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Explicit typeahead label. When set, overrides textContent for character search. */
    readonly label = input<string | undefined>(undefined);

    /** Emits when this item is selected. */
    readonly onSelect = output<string>();

    readonly checked = computed(() => this.radioGroupContext.value() === this.value());

    protected readonly highlighted = computed(() => this.isFocused());
    protected readonly getCheckedState = getCheckedState;

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

    onItemClick(): void {
        if (this.disabled()) {
            return;
        }
        this.selectItem();
    }

    protected onActivate(event: Event): void {
        if (this.disabled()) {
            return;
        }
        event.preventDefault();
        this.selectItem();
    }

    private selectItem(): void {
        const v = this.value();
        this.radioGroupContext.selectValue(v);
        this.onSelect.emit(v);
        if (this.closeOnClick()) this.rootContext?.close();
    }
}
