import { injectComboboxGroupContext } from './combobox-group';
import { ComboboxItemRef, injectComboboxRootContext } from './combobox-root';
import { RdxComboboxRow } from './combobox-row';
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
    Signal,
    signal
} from '@angular/core';
import { AcceptableValue, createContext, injectId } from '@radix-ng/primitives/core';

const itemContext = () => {
    const item = inject(RdxComboboxItem);
    return {
        isSelected: item.isSelected,
        isHighlighted: item.isHighlighted,
        disabled: item.disabled,
        // Read-only `Signal` (not `InputSignal`) so autocomplete's computed `value` is assignable too.
        value: item.value as Signal<AcceptableValue>
    };
};

export type RdxComboboxItemContext = ReturnType<typeof itemContext>;

export const [injectComboboxItemContext, provideComboboxItemContext] = createContext<RdxComboboxItemContext>(
    'RdxComboboxItemContext',
    'components/combobox'
);

/**
 * A selectable option. Registers itself with the root for filtering and navigation. Highlight is
 * virtual (`data-highlighted` + `aria-activedescendant` on the input) — items never take DOM focus.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxItem]',
    exportAs: 'rdxComboboxItem',
    providers: [provideComboboxItemContext(itemContext)],
    host: {
        '[attr.role]': 'role()',
        '[attr.id]': 'elementId()',
        '[attr.aria-selected]': 'selectable() ? isSelected() : undefined',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.aria-setsize]': 'ariaSetSize()',
        '[attr.aria-posinset]': 'ariaPosInSet()',
        '[attr.data-selected]': 'selectable() && isSelected() ? "" : undefined',
        '[attr.data-highlighted]': 'isHighlighted() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[hidden]': '!isVisible()',
        '[attr.data-hidden]': 'isVisible() ? undefined : ""',
        '(pointerdown)': 'onPointerDown($event)',
        '(mousedown)': 'onMouseDown($event)',
        '(mouseup)': 'onMouseUp($event)',
        '(click)': 'onClick($event)',
        '(pointermove)': 'onPointerMove()',
        '(pointerleave)': 'onPointerLeave($event)'
    }
})
export class RdxComboboxItem implements ComboboxItemRef {
    private readonly rootContext = injectComboboxRootContext();

    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    readonly id = injectId('rdx-combobox-item-');

    /** The option's value. */
    readonly value = input.required<AcceptableValue>();

    /** Explicit text matched against the query. Defaults to the element's text content. */
    readonly textValueInput = input<string>('', { alias: 'textValue' });

    /** Whether the option is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /**
     * The option's index in the list. Required in virtualized mode — it drives the deterministic id
     * (for `aria-activedescendant`), highlight matching, and selection when only a window is mounted.
     */
    readonly index = input<number>();

    protected readonly virtualized = this.rootContext.virtualized;

    private readonly autoTextValue = signal('');

    readonly textValue = computed(() => this.textValueInput() || this.autoTextValue());

    /** Host id: deterministic per-index in virtualized mode, otherwise a generated unique id. */
    protected readonly elementId = computed(() =>
        this.virtualized() ? this.rootContext.itemId(this.index() ?? -1) : this.id
    );

    protected readonly ariaSetSize = computed(() =>
        this.virtualized() ? this.rootContext.filteredItems().length : undefined
    );
    protected readonly ariaPosInSet = computed(() => (this.virtualized() ? (this.index() ?? -1) + 1 : undefined));

    /** The nearest enclosing grid row, if any (drives the `gridcell` role). */
    private readonly row = inject(RdxComboboxRow, { optional: true });

    /** `gridcell` only when actually inside a `RdxComboboxRow` of a grid list; otherwise `option`. */
    protected readonly role = computed(() => (this.rootContext.grid() && this.row ? 'gridcell' : 'option'));

    /**
     * Whether selection is a meaningful concept here (Base UI's `selectable`). In `selectionMode="none"`
     * (every autocomplete option, and a pure-search combobox) options carry no selection state, so
     * `aria-selected` / `data-selected` are omitted entirely rather than rendered as `false`.
     */
    protected readonly selectable = computed(() => this.rootContext.selectionMode() !== 'none');

    // Virtualized items are always rendered (the consumer only mounts the filtered window).
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
            // Virtualized items are not registered: the root navigates over `items` data by index, and
            // a windowed item mounting/unmounting must not churn the DOM-ordered registry or `labelFor`.
            if (this.virtualized()) {
                return;
            }
            if (!this.textValueInput()) {
                // Derive the match/label text from the element, excluding decorative indicator text
                // (e.g. a checkmark) so it doesn't pollute filtering or the input label.
                const clone = this.element.cloneNode(true) as HTMLElement;
                clone.querySelectorAll('[rdxComboboxItemIndicator]').forEach((node) => node.remove());
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
        // Keep focus on the input; prevent the item from stealing focus.
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
        this.commitSelection(event);
    }

    onClick(event: MouseEvent): void {
        // Primary selection trigger; also fires for programmatic `.click()`.
        this.commitSelection(event);
    }

    private commitSelection(event: Event): void {
        if (this.virtualized()) {
            this.rootContext.selectIndex(this.index() ?? -1, event);
        } else {
            this.rootContext.select(this, event);
        }
    }

    onPointerMove(): void {
        // Hover highlighting disabled: leave `data-highlighted` to keyboard/auto-highlight only.
        if (!this.rootContext.highlightItemOnHover()) {
            return;
        }
        // Ignore the first move after keyboard navigation: arrow keys scroll the list under a still
        // cursor, and the resulting pointer event must not yank the highlight off the keyboard target.
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
