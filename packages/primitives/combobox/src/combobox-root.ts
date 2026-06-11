import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    Injector,
    input,
    model,
    numberAttribute,
    output,
    signal,
    Signal,
    untracked
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    AcceptableValue,
    createContext,
    itemToStringLabel as defaultItemToStringLabel,
    Direction,
    injectId,
    isItemEqualToValue,
    isNullish,
    ItemValueComparator,
    useFilter,
    useListHighlight,
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';

/** The value a combobox can hold: a single value, an array (multiple mode), or nothing. */
export type ComboboxValue = AcceptableValue | AcceptableValue[];

/**
 * A combobox item, registered with the root so it participates in filtering, navigation, and
 * selection. Implemented by `RdxComboboxItem`; the root only depends on this structural shape to
 * avoid a circular import.
 */
export interface ComboboxItemRef {
    /** The option's element id, exposed via `aria-activedescendant` when highlighted. */
    readonly id: string;
    /** The option's host element, used for DOM-order sorting. */
    readonly element: HTMLElement;
    /** The option's value. */
    readonly value: Signal<AcceptableValue>;
    /** The text matched against the query and written to the input on selection. */
    readonly textValue: Signal<string>;
    /** Whether the option is disabled. */
    readonly disabled: Signal<boolean>;
}

/** A custom filter predicate: `(itemText, query) => matches`. */
export type ComboboxFilter = (itemText: string, query: string) => boolean;

const context = () => {
    const root = inject(RdxComboboxRoot);
    return {
        listId: root.listId,
        labelId: root.labelId,
        setLabelId: (id: string | undefined) => root.labelId.set(id),
        dir: root.dir,
        value: root.value,
        inputValue: root.inputValue,
        open: root.open,
        multiple: root.multiple,
        selectionMode: root.mode,
        disabledState: root.disabledState,
        readonly: root.readonly,
        requiredState: root.requiredState,
        openOnInputClick: root.openOnInputClick,
        modal: root.modal,
        highlightedItem: root.highlightedItem,
        activeId: root.activeId,
        isKeyboardActive: () => root.isKeyboardActive(),
        setKeyboardActive: (value: boolean) => root.setKeyboardActive(value),
        transitionStatus: root.transitionStatus,
        registerTransitionElement: root.registerTransitionElement,
        visibleCount: root.visibleCount,
        isVisible: (item: ComboboxItemRef) => root.isVisible(item),
        isSelected: (value: AcceptableValue) => root.isSelected(value),
        registerItem: (item: ComboboxItemRef) => root.registerItem(item),
        unregisterItem: (item: ComboboxItemRef) => root.unregisterItem(item),
        highlight: root.highlight,
        inputElement: root.inputElement.asReadonly(),
        setInputElement: (el: HTMLInputElement | null) => root.inputElement.set(el),
        registerTrigger: (el: HTMLElement | null) => (root.triggerElement = el),
        focusInput: () => root.focusInput(),
        openPopup: () => root.setOpen(true),
        openForBrowse: () => root.openForBrowse(),
        closePopup: (revert = true) => root.closePopup(revert),
        setInputValue: (value: string) => root.setInputValue(value),
        openAndHighlight: (edge: 'first' | 'last') => root.openAndHighlight(edge),
        select: (item: ComboboxItemRef) => root.handleSelect(item),
        selectHighlighted: () => root.selectHighlighted(),
        clearSelection: () => root.clearSelection(),
        removeValue: (value: AcceptableValue) => root.removeValue(value),
        removeLastValue: () => root.removeLastValue(),
        registerChipsNav: (fn: (() => boolean) | null) => root.registerChipsNav(fn),
        focusLastChip: () => root.focusLastChip(),
        labelFor: (value: AcceptableValue) => root.labelFor(value),
        markAsTouched: () => root.markAsTouched()
    };
};

export type RdxComboboxRootContext = ReturnType<typeof context>;

export const [injectComboboxRootContext, provideComboboxRootContext] =
    createContext<RdxComboboxRootContext>('RdxComboboxRootContext');

/**
 * Root of a Combobox — a filterable select. Owns selection, input text, open state, filtering, and
 * highlight-model navigation, and exposes them to the parts through {@link RdxComboboxRootContext}.
 * Implements `ControlValueAccessor` for forms.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxRoot]',
    exportAs: 'rdxComboboxRoot',
    providers: [
        provideComboboxRootContext(context),
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxComboboxRoot, multi: true }
    ],
    hostDirectives: [RdxPopper],
    host: {
        '[attr.data-disabled]': 'disabledState() ? "" : undefined'
    }
})
export class RdxComboboxRoot implements ControlValueAccessor {
    private readonly injector = inject(Injector);

    /** Selected value(s). A single value in single mode, an array in `multiple` mode. */
    readonly value = model<ComboboxValue | null>(null);

    /** Initial value when uncontrolled. */
    readonly defaultValue = input<ComboboxValue | null>();

    /** The text currently in the input. */
    readonly inputValue = model<string>('');

    /** Whether the popup is open. */
    readonly open = model<boolean>(false);

    /** Initial open state when uncontrolled. */
    readonly defaultOpen = input(false, { transform: booleanAttribute });

    /** Whether multiple values can be selected. Shorthand for `selectionMode="multiple"`. */
    readonly multipleInput = input(false, { alias: 'multiple', transform: booleanAttribute });

    /**
     * Selection behavior. `'single'` / `'multiple'` commit a value; `'none'` filters without
     * selecting (a pure search/command UI). Defaults from the `multiple` shorthand.
     */
    readonly selectionMode = input<'single' | 'multiple' | 'none'>();

    /** Resolved selection mode. */
    readonly mode = computed<'single' | 'multiple' | 'none'>(
        () => this.selectionMode() ?? (this.multipleInput() ? 'multiple' : 'single')
    );

    /** Whether the combobox is in multiple-selection mode. */
    readonly multiple = computed(() => this.mode() === 'multiple');

    /** In `'none'` mode, whether pressing an item fills the input with its label. */
    readonly fillInputOnItemPress = input(true, { transform: booleanAttribute });

    /** Text direction. */
    readonly dir = input<Direction>('ltr');

    /** Whether the combobox is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /** Whether the combobox is read-only. */
    readonly readonly = input(false, { transform: booleanAttribute });

    /** Whether a value is required (for forms). */
    readonly required = input(false, { transform: booleanAttribute });

    /** Whether keyboard navigation wraps at the list boundaries. */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    /**
     * Auto-highlight behavior:
     * - `false` (default): never auto-highlight;
     * - `true` / `'input-change'`: highlight the first match as the query changes;
     * - `'always'`: keep the first navigable item highlighted whenever the popup is open.
     */
    readonly autoHighlight = input<boolean | 'always' | 'input-change'>(false);

    /** Resolved auto-highlight mode. */
    readonly autoHighlightMode = computed<'off' | 'input-change' | 'always'>(() => {
        const value = this.autoHighlight();
        if (value === 'always') {
            return 'always';
        }
        if (value === true || value === 'input-change') {
            return 'input-change';
        }
        return 'off';
    });

    /** Whether clicking the input opens the popup. */
    readonly openOnInputClick = input(true, { transform: booleanAttribute });

    /** Whether the popup is modal: locks page scroll and makes outside content inert while open. */
    readonly modal = input(false, { transform: booleanAttribute });

    /** Whether selecting an item requests submit of the closest form. */
    readonly submitOnItemClick = input(false, { transform: booleanAttribute });

    /**
     * Filter applied to items against the input query.
     * - `undefined` (default): locale-aware "contains" via {@link useFilter};
     * - a function: custom matching;
     * - `null`: built-in filtering disabled (the consumer controls which items exist).
     */
    readonly filter = input<ComboboxFilter | null | undefined>(undefined);

    /** Maximum number of matching items to show. `-1` (default) means no limit. */
    readonly limit = input(-1, { transform: numberAttribute });

    /** How item values are compared for equality (function or object key). */
    readonly by = input<ItemValueComparator<AcceptableValue>>();

    /** Converts a value to its display label. Defaults to the matching item's text. */
    readonly itemToStringLabel = input<(value: AcceptableValue) => string>();

    /** Emits when the selection changes. */
    readonly onValueChange = output<ComboboxValue | null>();

    /** Emits when the input text changes. */
    readonly onInputValueChange = output<string>();

    /** Emits when the popup opens or closes. */
    readonly onOpenChange = output<boolean>();

    /** Emits the highlighted item's value (or `null`) as the highlight moves. */
    readonly onItemHighlighted = output<AcceptableValue | null>();

    /** Emits after the open/close transition (including any exit animation) finishes. */
    readonly onOpenChangeComplete = output<boolean>();

    private readonly transition = useTransitionStatus((open) => this.onOpenChangeComplete.emit(open));

    /** Open/close transition phase, for `data-starting-style` / `data-ending-style`. */
    readonly transitionStatus = this.transition.status;

    /** Registers the popup element whose animation determines transition completion. */
    readonly registerTransitionElement = this.transition.registerElement;

    readonly listId = injectId('rdx-combobox-list-');

    readonly labelId = signal<string | undefined>(undefined);

    readonly inputElement = signal<HTMLInputElement | null>(null);

    private readonly cvaDisabled = signal(false);
    readonly disabledState = computed(() => this.disabled() || this.cvaDisabled());
    readonly requiredState = computed(() => this.required());

    private readonly defaultFilter = useFilter();

    /**
     * Whether the input text is a fresh user query rather than the current selection's label. While
     * `false` (just opened, or showing a selected label), the list is unfiltered so the user can
     * browse; it flips `true` on the first keystroke.
     */
    private readonly typed = signal(false);

    private readonly _items = signal<readonly ComboboxItemRef[]>([]);

    /** Registered items, sorted into DOM order. */
    readonly orderedItems = computed(() => {
        const items = [...this._items()];
        return items.sort((a, b) => {
            const position = a.element.compareDocumentPosition(b.element);
            if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
                return -1;
            }
            if (position & Node.DOCUMENT_POSITION_PRECEDING) {
                return 1;
            }
            return 0;
        });
    });

    /** Matching items in DOM order, capped at `limit`. The set of items the list shows. */
    readonly visibleItems = computed(() => {
        const matching = this.orderedItems().filter((item) => this.matchesFilter(item));
        const limit = this.limit();
        return limit >= 0 ? matching.slice(0, limit) : matching;
    });

    private readonly visibleSet = computed(() => new Set(this.visibleItems()));

    readonly visibleCount = computed(() => this.visibleItems().length);

    readonly highlight = useListHighlight<ComboboxItemRef>({
        items: this.orderedItems,
        isNavigable: (item) => this.isVisible(item) && !item.disabled(),
        getId: (item) => item.id,
        loop: this.loopFocus,
        injector: this.injector
    });

    readonly highlightedItem = this.highlight.highlightedItem;
    readonly activeId = this.highlight.activeId;

    /** Edge to highlight once the list has mounted (items register asynchronously after opening). */
    private readonly pendingHighlightEdge = signal<'first' | 'last' | null>(null);

    private onChange?: (value: ComboboxValue | null) => void;
    private onTouched?: () => void;

    constructor() {
        // Apply uncontrolled defaults once.
        effect(() => {
            const initial = this.defaultValue();
            if (initial !== undefined && untracked(this.value) === null) {
                this.value.set(initial);
            }
        });
        effect(() => {
            if (untracked(this.open) === false && this.defaultOpen()) {
                this.open.set(true);
            }
        });

        // Emit open changes and drive the open/close transition (skip the initial run).
        let previousOpen = untracked(this.open);
        effect(() => {
            const open = this.open();
            if (open === previousOpen) {
                return;
            }
            previousOpen = open;
            untracked(() => {
                this.onOpenChange.emit(open);
                this.transition.start(open);
            });
        });

        // Emit highlight changes (skip the initial run).
        let highlightInitialized = false;
        effect(() => {
            const item = this.highlightedItem();
            if (!highlightInitialized) {
                highlightInitialized = true;
                return;
            }
            untracked(() => this.onItemHighlighted.emit(item ? item.value() : null));
        });

        // Apply a deferred open-edge highlight once items have registered.
        effect(() => {
            const edge = this.pendingHighlightEdge();
            const hasItems = this.orderedItems().length > 0;
            if (!this.open() || edge === null || !hasItems) {
                return;
            }
            untracked(() => {
                if (edge === 'first') {
                    this.highlight.first();
                } else {
                    this.highlight.last();
                }
                this.pendingHighlightEdge.set(null);
            });
        });

        // autoHighlight 'always': keep the first navigable item highlighted whenever the popup is
        // open. `visibleCount` re-runs this when filtering changes; `highlightedItem` is read
        // untracked to re-establish a highlight only after the self-heal clears it (no loop).
        effect(() => {
            this.orderedItems();
            this.visibleCount();
            if (this.autoHighlightMode() === 'always' && this.open()) {
                untracked(() => {
                    if (this.highlightedItem() === null) {
                        this.highlight.first();
                    }
                });
            }
        });
    }

    /** Opens the popup for browsing (resets the query to "pristine" and selects the input text). */
    openForBrowse(): void {
        if (!this.open()) {
            this.typed.set(false);
        }
        this.setOpen(true);
        this.selectInputText();
        if (this.autoHighlightMode() === 'always') {
            this.pendingHighlightEdge.set('first');
        }
    }

    /** Opens the popup and highlights the given edge once the list mounts. */
    openAndHighlight(edge: 'first' | 'last'): void {
        if (!this.open()) {
            this.typed.set(false);
        }
        this.setOpen(true);
        this.selectInputText();
        this.pendingHighlightEdge.set(edge);
    }

    /** Whether the item matches the active query (ignores the `limit` cap). */
    private matchesFilter(item: ComboboxItemRef): boolean {
        const filter = this.filter();
        if (filter === null) {
            return true;
        }
        // Until the user types a fresh query, show the whole list (the input may still hold the
        // selected item's label, which must not filter everything down to just that item).
        const query = this.typed() ? (this.inputValue() ?? '') : '';
        const matcher = filter ?? this.defaultFilter.contains;
        return matcher(item.textValue(), query);
    }

    /** Whether the item is shown in the list (matches the query and is within `limit`). */
    isVisible(item: ComboboxItemRef): boolean {
        return this.visibleSet().has(item);
    }

    // Tracks whether the last interaction was the keyboard, so the highlight doesn't jump to an item
    // the cursor happens to rest on when arrow-key navigation scrolls the list under a still pointer.
    private keyboardActive = false;
    isKeyboardActive(): boolean {
        return this.keyboardActive;
    }
    setKeyboardActive(value: boolean): void {
        this.keyboardActive = value;
    }

    isSelected(value: AcceptableValue): boolean {
        if (this.mode() === 'none') {
            return false;
        }
        const current = this.value();
        if (this.multiple()) {
            return Array.isArray(current) && current.some((v) => isItemEqualToValue(v, value, this.by()));
        }
        return !isNullish(current) && isItemEqualToValue(current as AcceptableValue, value, this.by());
    }

    registerItem(item: ComboboxItemRef): void {
        this._items.update((items) => [...items, item]);
    }

    unregisterItem(item: ComboboxItemRef): void {
        this._items.update((items) => items.filter((i) => i !== item));
    }

    setOpen(open: boolean): void {
        if (this.disabledState() || this.readonly()) {
            return;
        }
        this.open.set(open);
    }

    closePopup(revert = true): void {
        if (!this.open()) {
            return;
        }
        this.open.set(false);
        this.highlight.clear();
        if (revert) {
            this.revertInputValue();
        }
        this.markAsTouched();
    }

    /** Updates the input text from user typing (marks the query as a fresh user query). */
    setInputValue(value: string): void {
        this.inputValue.set(value);
        this.typed.set(true);
        this.onInputValueChange.emit(value);
        // Auto-highlight the first match as the query changes (deferred so it lands after items mount).
        if (this.autoHighlightMode() !== 'off') {
            this.pendingHighlightEdge.set('first');
        }
    }

    /** Sets the input text programmatically (a selection label / revert) — not a user query. */
    private setLabel(value: string): void {
        this.inputValue.set(value);
        this.typed.set(false);
        this.onInputValueChange.emit(value);
    }

    /** Selects all input text so the next keystroke replaces a stale selection label. */
    selectInputText(): void {
        this.inputElement()?.select();
    }

    /** Resets the input text to the current selection's label (single mode) or empty. */
    private revertInputValue(): void {
        if (this.multiple()) {
            this.setLabel('');
            return;
        }
        const current = this.value();
        this.setLabel(isNullish(current) ? '' : this.labelFor(current as AcceptableValue));
    }

    labelFor(value: AcceptableValue): string {
        const custom = this.itemToStringLabel();
        if (custom) {
            return custom(value);
        }
        const item = this.orderedItems().find((i) => isItemEqualToValue(i.value(), value, this.by()));
        return item ? item.textValue() : defaultItemToStringLabel(value);
    }

    handleSelect(item: ComboboxItemRef): void {
        if (this.disabledState() || this.readonly() || item.disabled()) {
            return;
        }

        if (this.mode() === 'none') {
            // No value is committed; `onValueChange` fires as a pointer/keyboard activation signal so
            // command-palette consumers can react. Optionally fill the input, then close.
            this.onValueChange.emit(item.value());
            if (this.fillInputOnItemPress()) {
                this.setLabel(item.textValue() || this.labelFor(item.value()));
            }
            this.open.set(false);
            this.highlight.clear();
            this.restoreFocusAfterSelect();
            this.maybeSubmit();
            return;
        }

        if (this.multiple()) {
            const current = Array.isArray(this.value()) ? [...(this.value() as AcceptableValue[])] : [];
            const index = current.findIndex((v) => isItemEqualToValue(v, item.value(), this.by()));
            if (index === -1) {
                current.push(item.value());
            } else {
                current.splice(index, 1);
            }
            this.commitValue(current);
            this.setLabel('');
            this.focusInput();
        } else {
            this.commitValue(item.value());
            this.setLabel(item.textValue() || this.labelFor(item.value()));
            this.open.set(false);
            this.highlight.clear();
            this.restoreFocusAfterSelect();
        }

        this.maybeSubmit();
    }

    /** Requests submit of the closest form when `submitOnItemClick` is enabled. */
    private maybeSubmit(): void {
        if (this.submitOnItemClick()) {
            this.inputElement()?.form?.requestSubmit?.();
        }
    }

    selectHighlighted(): void {
        const item = this.highlightedItem();
        if (item) {
            this.handleSelect(item);
        }
    }

    clearSelection(): void {
        this.commitValue(this.multiple() ? [] : null);
        this.setLabel('');
        this.focusInput();
    }

    removeValue(value: AcceptableValue): void {
        if (!this.multiple() || !Array.isArray(this.value())) {
            return;
        }
        const next = (this.value() as AcceptableValue[]).filter((v) => !isItemEqualToValue(v, value, this.by()));
        this.commitValue(next);
    }

    removeLastValue(): void {
        if (!this.multiple() || !Array.isArray(this.value())) {
            return;
        }
        const current = this.value() as AcceptableValue[];
        if (current.length > 0) {
            this.commitValue(current.slice(0, -1));
        }
    }

    /** The trigger element, used as a focus fallback when the input lives inside the popup. */
    triggerElement: HTMLElement | null = null;

    focusInput(): void {
        this.inputElement()?.focus();
    }

    /**
     * Restores focus after a selection closes the popup, so the keyboard can reopen it. When the
     * input lives inside the popup it is about to unmount, so focus goes to the trigger instead;
     * otherwise it returns to the input. Done synchronously while the input is still in the DOM.
     */
    restoreFocusAfterSelect(): void {
        const input = this.inputElement();
        if (input && !input.closest('[rdxComboboxPopup]')) {
            input.focus();
        } else {
            this.triggerElement?.focus();
        }
    }

    private chipsFocusLast: (() => boolean) | null = null;

    /** Registered by `RdxComboboxChips` so the input can hand keyboard focus to the chips. */
    registerChipsNav(fn: (() => boolean) | null): void {
        this.chipsFocusLast = fn;
    }

    /** Moves focus to the last chip, if any. Returns whether a chip was focused. */
    focusLastChip(): boolean {
        return this.chipsFocusLast?.() ?? false;
    }

    markAsTouched(): void {
        this.onTouched?.();
    }

    private commitValue(value: ComboboxValue | null): void {
        this.value.set(value);
        this.onValueChange.emit(value);
        this.onChange?.(value);
    }

    // ControlValueAccessor
    writeValue(value: ComboboxValue | null): void {
        untracked(() => this.value.set(value));
    }

    registerOnChange(fn: (value: ComboboxValue | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.cvaDisabled.set(isDisabled);
    }
}
