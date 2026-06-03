import { injectRdxMenuRadioGroupContext } from './menu-radio-group';
import { injectRdxMenuRootContext } from './menu-root';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    output,
    Signal,
    signal
} from '@angular/core';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import { BooleanInput, createContext } from '@radix-ng/primitives/core';

export interface RdxMenuRadioItemContext {
    checked: Signal<boolean>;
}

export const [injectRdxMenuRadioItemContext, provideRdxMenuRadioItemContext] = createContext<RdxMenuRadioItemContext>(
    'RdxMenuRadioItemContext',
    'components/menu'
);

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
    hostDirectives: [RdxCompositeListItem],
    host: {
        role: 'menuitemradio',
        '[attr.tabindex]': 'rootContext?.isOpen() && highlighted() ? 0 : -1',
        '[attr.aria-checked]': 'checked()',
        '[attr.data-checked]': 'checked() ? "" : undefined',
        '[attr.data-unchecked]': 'checked() ? undefined : ""',
        '[attr.data-disabled]': 'effectiveDisabled() ? "" : undefined',
        '[attr.aria-disabled]': 'effectiveDisabled() ? true : undefined',
        '[attr.data-highlighted]': 'highlighted() ? "" : undefined',
        '[attr.data-label]': 'label() ?? undefined',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerleave)': 'onPointerLeave($event)',
        '(mouseup)': 'onMouseUp($event)',
        '(click)': 'onItemClick()',
        '(keydown.enter)': 'onActivate($event)',
        '(keydown.space)': 'onActivate($event)'
    }
})
export class RdxMenuRadioItem<T = unknown> {
    protected readonly rootContext = injectRdxMenuRootContext(true);
    private readonly radioGroupContext = injectRdxMenuRadioGroupContext();
    private readonly listItem = inject(RdxCompositeListItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly isFocused = signal(false);

    /** The value of this radio item. */
    readonly value = input.required<T>();

    /** Whether this item is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether selecting closes the menu. Defaults to false — radio items stay open. */
    readonly closeOnClick = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Explicit typeahead label. When set, overrides textContent for character search. */
    readonly label = input<string | undefined>(undefined);

    /** Emits when this item is selected. */
    readonly onSelect = output<T>();

    readonly checked = computed(() => this.radioGroupContext.value() === this.value());

    protected readonly highlighted = computed(
        () => this.rootContext?.activeIndex() === this.listItem.index() || this.isFocused()
    );
    protected readonly effectiveDisabled = computed(
        () => this.disabled() || this.radioGroupContext.disabled() || (this.rootContext?.disabled() ?? false)
    );

    constructor() {
        effect(() => {
            this.listItem.setMetadata({
                type: 'radio-item',
                disabled: this.effectiveDisabled(),
                label: this.label()
            });
        });
    }

    onFocus(): void {
        if (!this.rootContext?.disabled()) {
            this.isFocused.set(true);
        }
        this.setActiveIndex();
    }

    onBlur(): void {
        this.isFocused.set(false);
        this.clearActiveIndex();
    }

    onPointerMove(event: PointerEvent): void {
        if (event.defaultPrevented || event.pointerType !== 'mouse' || this.effectiveDisabled()) {
            return;
        }
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
        if (this.elementRef.nativeElement.ownerDocument.activeElement === this.elementRef.nativeElement) {
            this.isFocused.set(false);
            this.clearActiveIndex();
            this.elementRef.nativeElement.closest<HTMLElement>('[rdxMenuPopup]')?.focus({ preventScroll: true });
        }
    }

    onItemClick(): void {
        if (this.effectiveDisabled()) {
            return;
        }
        this.selectItem();
    }

    onMouseUp(event: MouseEvent): void {
        if (this.effectiveDisabled() || event.button !== 0 || !this.rootContext?.allowMouseUpTrigger()) {
            return;
        }

        this.rootContext.setAllowMouseUpTrigger(false);
        this.elementRef.nativeElement.click();
    }

    protected onActivate(event: Event): void {
        if (this.effectiveDisabled()) {
            return;
        }
        event.preventDefault();
        this.selectItem();
    }

    private selectItem(): void {
        const v = this.value();
        this.radioGroupContext.selectValue(v);
        this.onSelect.emit(v);
        if (this.closeOnClick()) this.rootContext?.closeEntireMenu();
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
