import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    signal
} from '@angular/core';
import {
    ComboboxItemRef,
    injectComboboxGroupContext,
    injectComboboxRootContext,
    provideComboboxItemContext
} from '@radix-ng/primitives/combobox';
import { AcceptableValue, injectId } from '@radix-ng/primitives/core';

const itemContext = () => {
    const item = inject(RdxAutocompleteItem);
    return {
        isSelected: item.isSelected,
        isHighlighted: item.isHighlighted,
        disabled: item.disabled,
        value: item.value
    };
};

/**
 * A selectable suggestion. Registers itself with the root for filtering and navigation. Highlight is
 * virtual (`data-highlighted` + `aria-activedescendant` on the input) — items never take DOM focus.
 * Selecting an item writes its text into the input. Unlike the combobox item, the `value` is optional;
 * when omitted, selection falls back to the option's text content (autocomplete's value is the input string).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteItem]',
    exportAs: 'rdxAutocompleteItem',
    providers: [provideComboboxItemContext(itemContext)],
    host: {
        role: 'option',
        '[attr.id]': 'elementId()',
        '[attr.aria-selected]': 'isSelected()',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.aria-setsize]': 'ariaSetSize()',
        '[attr.aria-posinset]': 'ariaPosInSet()',
        '[attr.data-selected]': 'isSelected() ? "" : undefined',
        '[attr.data-highlighted]': 'isHighlighted() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[hidden]': '!isVisible()',
        '[attr.data-hidden]': 'isVisible() ? undefined : ""',
        '(pointerdown)': 'onPointerDown($event)',
        '(mousedown)': 'onPointerDown($event)',
        '(pointerup)': 'onPointerUp()',
        '(pointermove)': 'onPointerMove()',
        '(pointerleave)': 'onPointerLeave($event)'
    }
})
export class RdxAutocompleteItem implements ComboboxItemRef {
    private readonly rootContext = injectComboboxRootContext();

    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    readonly id = injectId('rdx-autocomplete-item-');

    /** The option's value. When omitted, selecting the item writes its text content into the input. */
    readonly value = input<AcceptableValue>('');

    /** Explicit text matched against the query and written to the input. Defaults to text content. */
    readonly textValueInput = input<string>('', { alias: 'textValue' });

    /** Whether the option is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /** The option's index in the list. Required in virtualized mode. */
    readonly index = input<number>();

    protected readonly virtualized = this.rootContext.virtualized;

    private readonly autoTextValue = signal('');

    readonly textValue = computed(() => this.textValueInput() || this.autoTextValue());

    protected readonly elementId = computed(() =>
        this.virtualized() ? this.rootContext.itemId(this.index() ?? -1) : this.id
    );

    protected readonly ariaSetSize = computed(() =>
        this.virtualized() ? this.rootContext.filteredItems().length : undefined
    );
    protected readonly ariaPosInSet = computed(() => (this.virtualized() ? (this.index() ?? -1) + 1 : undefined));

    readonly isVisible = computed(() => (this.virtualized() ? true : this.rootContext.isVisible(this)));
    readonly isSelected = computed(() => this.rootContext.isSelected(this.value()));
    readonly isHighlighted = computed(() =>
        this.virtualized()
            ? this.rootContext.highlightedIndex() === this.index()
            : this.rootContext.highlightedItem() === this
    );

    private readonly group = injectComboboxGroupContext(true);

    constructor() {
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            if (this.virtualized()) {
                return;
            }
            if (!this.textValueInput()) {
                const clone = this.element.cloneNode(true) as HTMLElement;
                clone.querySelectorAll('[rdxAutocompleteItemIndicator]').forEach((node) => node.remove());
                this.autoTextValue.set(clone.textContent?.trim() ?? '');
            }
            this.rootContext.registerItem(this);
            this.group?.registerItem(this);
        });

        destroyRef.onDestroy(() => {
            if (this.virtualized()) {
                return;
            }
            this.rootContext.unregisterItem(this);
            this.group?.unregisterItem(this);
        });

        // Keep the highlighted option in view while navigating a scrollable popup. `block: 'nearest'`
        // makes hover a no-op (the item is already visible) and only scrolls on keyboard navigation.
        afterRenderEffect(() => {
            if (!this.virtualized() && this.isHighlighted()) {
                this.element.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    onPointerDown(event: MouseEvent): void {
        event.preventDefault();
        this.rootContext.setKeyboardActive(false);
    }

    onPointerUp(): void {
        if (this.virtualized()) {
            this.rootContext.selectIndex(this.index() ?? -1);
        } else {
            this.rootContext.select(this);
        }
    }

    onPointerMove(): void {
        // Hover highlighting disabled: leave `data-highlighted` to keyboard/auto-highlight only.
        if (!this.rootContext.highlightItemOnHover()) {
            return;
        }
        if (this.rootContext.isKeyboardActive()) {
            this.rootContext.setKeyboardActive(false);
            return;
        }
        if (this.disabled()) {
            return;
        }
        if (this.virtualized()) {
            this.rootContext.highlightIndex(this.index() ?? -1, 'pointer');
        } else if (this.isVisible()) {
            this.rootContext.setHighlight(this, 'pointer');
        }
    }

    // Clear a pointer-driven highlight when the cursor leaves the list (unless `keepHighlight`).
    // Moving to another element inside the list keeps it (the next item's move re-highlights).
    onPointerLeave(event: PointerEvent): void {
        if (
            event.pointerType === 'touch' ||
            !this.rootContext.open() ||
            !this.rootContext.highlightItemOnHover() ||
            this.rootContext.keepHighlight()
        ) {
            return;
        }
        const related = event.relatedTarget as Node | null;
        const list = related && document.getElementById(this.rootContext.listId);
        if (list && list.contains(related)) {
            return;
        }
        this.rootContext.clearHighlight();
    }
}
