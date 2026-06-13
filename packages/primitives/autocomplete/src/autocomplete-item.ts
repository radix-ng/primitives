import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
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
import { RdxAutocompleteRow } from './autocomplete-row';

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
        '[attr.role]': 'role()',
        '[attr.id]': 'elementId()',
        // Autocomplete is always `selectionMode="none"`, so options carry no selection state: Base UI
        // omits `aria-selected` / `data-selected` here entirely (rather than rendering `false`).
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.aria-setsize]': 'ariaSetSize()',
        '[attr.aria-posinset]': 'ariaPosInSet()',
        '[attr.data-highlighted]': 'isHighlighted() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[hidden]': '!isVisible()',
        '[attr.data-hidden]': 'isVisible() ? undefined : ""',
        '(pointerdown)': 'onPointerDown($event)',
        '(mousedown)': 'onMouseDown($event)',
        '(mouseup)': 'onMouseUp($event)',
        '(click)': 'onClick()',
        '(pointermove)': 'onPointerMove()',
        '(pointerleave)': 'onPointerLeave($event)'
    }
})
export class RdxAutocompleteItem implements ComboboxItemRef {
    private readonly rootContext = injectComboboxRootContext();

    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    readonly id = injectId('rdx-autocomplete-item-');

    /**
     * The explicit `[value]`, or `undefined` when omitted. Read the resolved {@link value} instead —
     * it falls back to the text content only when no value was bound (so explicit falsy values like
     * `0` / `''` / `null` are preserved for the filter and selection).
     */
    readonly valueInput = input<AcceptableValue | undefined>(undefined, { alias: 'value' });

    /** Explicit text matched against the query and written to the input. Defaults to text content. */
    readonly textValueInput = input<string>('', { alias: 'textValue' });

    /** Whether the option is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /** The option's index in the list. Required in virtualized mode. */
    readonly index = input<number>();

    protected readonly virtualized = this.rootContext.virtualized;

    private readonly autoTextValue = signal('');

    readonly textValue = computed(() => this.textValueInput() || this.autoTextValue());

    /**
     * The option's effective value: the explicit `[value]` if bound (preserving `0` / `''` / `null`),
     * otherwise the text content (autocomplete's value is the input string). Only an absent input —
     * `undefined` — falls back, so a custom filter still sees the real `itemValue` for falsy values.
     */
    readonly value = computed<AcceptableValue>(() => {
        const bound = this.valueInput();
        return bound === undefined ? this.textValue() : bound;
    });

    protected readonly elementId = computed(() =>
        this.virtualized() ? this.rootContext.itemId(this.index() ?? -1) : this.id
    );

    protected readonly ariaSetSize = computed(() =>
        this.virtualized() ? this.rootContext.filteredItems().length : undefined
    );
    protected readonly ariaPosInSet = computed(() => (this.virtualized() ? (this.index() ?? -1) + 1 : undefined));

    /** The nearest enclosing grid row, if any (drives the `gridcell` role). */
    private readonly row = inject(RdxAutocompleteRow, { optional: true });

    /** `gridcell` only when actually inside a `RdxAutocompleteRow` of a grid list; otherwise `option`. */
    protected readonly role = computed(() => (this.rootContext.grid() && this.row ? 'gridcell' : 'option'));

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

        // Reset the press flag whenever the popup closes (matches Base UI), so a later drag-end onto
        // this item isn't blocked by a stale press from an earlier interaction.
        effect(() => {
            if (!this.rootContext.open()) {
                this.pointerDownStarted = false;
            }
        });
    }

    // Whether a primary-button pointerdown started on **this** item. A normal press+release here is
    // committed by `click`; `mouseup` is only the drag-end fallback for a press that began *elsewhere*.
    private pointerDownStarted = false;

    onPointerDown(event: MouseEvent): void {
        if (event.button !== 0) {
            return;
        }
        event.preventDefault();
        this.rootContext.setKeyboardActive(false);
        this.pointerDownStarted = true;
    }

    onMouseDown(event: MouseEvent): void {
        // Belt-and-suspenders for keeping focus on the input (and iOS Safari blur on tap).
        if (event.button === 0) {
            event.preventDefault();
        }
    }

    onMouseUp(event: MouseEvent): void {
        // Read-and-reset the press flag first (matches Base UI), so a press+release here doesn't leave
        // it set and block a later drag-end onto this same item. Drag-end: commit when the primary
        // button is released over the highlighted item while the press began on a *different* element
        // (so `click` won't fire here). A press that began on this item is committed by `click` instead.
        const startedHere = this.pointerDownStarted;
        this.pointerDownStarted = false;
        if (event.button !== 0 || startedHere || !this.isHighlighted()) {
            return;
        }
        this.commitSelection();
    }

    onClick(): void {
        // Primary selection trigger; also fires for programmatic `.click()`.
        this.commitSelection();
    }

    private commitSelection(): void {
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
