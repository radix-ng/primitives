import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    Injector,
    input,
    isDevMode,
    model,
    numberAttribute,
    output,
    signal,
    untracked
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    ComboboxHighlightReason,
    ComboboxItemHighlightedDetails,
    ComboboxItemRef,
    provideComboboxRootContext,
    RdxComboboxRootContext
} from '@radix-ng/primitives/combobox';
import {
    AcceptableValue,
    BooleanInput,
    itemToStringLabel as defaultItemToStringLabel,
    Direction,
    injectId,
    isItemEqualToValue,
    ItemValueComparator,
    rdxDevWarning,
    useFilter,
    useListHighlight,
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';

/**
 * Autocomplete filtering / inline-completion behavior, mirroring Base UI's `mode`:
 * - `'list'` (default): items are filtered by the query; the input text never changes from the active item.
 * - `'both'`: items are filtered **and** the input is inline-completed from the active item.
 * - `'inline'`: items are static (not filtered) but the input is inline-completed from the active item.
 * - `'none'`: items are static and the input is never changed from the active item.
 */
export type AutocompleteMode = 'list' | 'both' | 'inline' | 'none';

/**
 * A custom filter predicate. Receives the item's text, the query, and the item's value (the object
 * for object items) so a filter can match across multiple fields — e.g. fuzzy/multi-key matching.
 */
export type AutocompleteFilter = (itemText: string, query: string, itemValue: AcceptableValue) => boolean;

/** Why the input value changed, mirroring Base UI's `onValueChange` details. */
export type AutocompleteChangeReason = 'input-change' | 'item-press' | 'input-clear' | 'none';

/** Payload of {@link RdxAutocompleteRoot.onValueChange}: the new value and why it changed. */
export interface AutocompleteValueChangeDetails {
    /** The new input value. */
    value: string;
    /** What caused the change (e.g. skip `'item-press'` to avoid overwriting an external value). */
    reason: AutocompleteChangeReason;
}

/** Re-exported for consumers: the highlight reason and payload shape are shared with the combobox engine. */
export type {
    ComboboxHighlightReason as AutocompleteHighlightReason,
    ComboboxItemHighlightedDetails as AutocompleteItemHighlightedDetails
} from '@radix-ng/primitives/combobox';

/**
 * Builds the {@link RdxComboboxRootContext} the autocomplete parts consume. Autocomplete reuses the
 * combobox parts (List, Popup, Positioner, Item, …) verbatim, so the root exposes the exact combobox
 * context shape — configured for a single-value, `selectionMode: 'none'` control whose value is the
 * input string. Autocomplete-specific state (mode, inline completion, grid) is read by the local
 * parts via direct injection of {@link RdxAutocompleteRoot}.
 */
const context = (): RdxComboboxRootContext => {
    const root = inject(RdxAutocompleteRoot);
    return {
        listId: root.listId,
        labelId: root.labelId,
        setLabelId: (id: string | undefined) => root.labelId.set(id),
        dir: root.dir,
        value: root.value,
        inputValue: root.value,
        open: root.open,
        multiple: root.alwaysFalse,
        selectionMode: root.noneMode,
        disabledState: root.disabledState,
        readonly: root.readOnly,
        requiredState: root.requiredState,
        openOnInputClick: root.openOnInputClick,
        modal: root.modal,
        virtualized: root.virtualized,
        filteredItems: root.filteredItems,
        highlightedItem: root.highlightedItem,
        highlightedIndex: root.highlightedIndex.asReadonly(),
        activeId: root.activeId,
        itemId: (index: number) => root.itemId(index),
        isKeyboardActive: () => root.isKeyboardActive(),
        setKeyboardActive: (value: boolean) => root.setKeyboardActive(value),
        transitionStatus: root.transitionStatus,
        registerTransitionElement: root.registerTransitionElement,
        visibleCount: root.visibleCount,
        isVisible: (item: ComboboxItemRef) => root.isVisible(item),
        isSelected: (value: AcceptableValue) => root.isSelectedValue(value),
        registerItem: (item: ComboboxItemRef) => root.registerItem(item),
        unregisterItem: (item: ComboboxItemRef) => root.unregisterItem(item),
        highlight: root.highlight,
        highlightNext: () => root.moveDown(),
        highlightPrevious: () => root.moveUp(),
        highlightFirst: () => root.highlightFirst('keyboard'),
        highlightLast: () => root.highlightLast('keyboard'),
        highlightIndex: (index: number, reason: ComboboxHighlightReason) => root.highlightIndex(index, reason),
        setHighlight: (item: ComboboxItemRef, reason: ComboboxHighlightReason) => root.setHighlight(item, reason),
        clearHighlight: () => root.clearHighlightState(),
        highlightItemOnHover: root.highlightItemOnHover,
        keepHighlight: root.keepHighlight,
        inputElement: root.inputElement.asReadonly(),
        setInputElement: (el: HTMLInputElement | null) => root.inputElement.set(el),
        registerTrigger: (el: HTMLElement | null) => (root.triggerElement = el),
        focusInput: () => root.focusInput(),
        openPopup: () => root.setOpen(true),
        openForBrowse: () => root.openForBrowse(),
        closePopup: (revert = true) => root.closePopup(revert),
        setInputValue: (value: string) => root.setQuery(value),
        openAndHighlight: (edge: 'first' | 'last') => root.openAndHighlight(edge),
        select: (item: ComboboxItemRef) => root.handleSelect(item),
        selectIndex: (index: number) => root.selectIndex(index),
        selectHighlighted: () => root.selectHighlighted(),
        clearSelection: () => root.clearValue(),
        removeValue: () => undefined,
        removeLastValue: () => undefined,
        registerChipsNav: () => undefined,
        focusLastChip: () => false,
        labelFor: (value: AcceptableValue) => root.labelFor(value),
        markAsTouched: () => root.markAsTouched()
    } as RdxComboboxRootContext;
};

/**
 * `autoHighlight` transform: pass `'always'` through verbatim, coerce everything else as a boolean
 * attribute (so the bare `autoHighlight` attribute reads `true`).
 *
 * Kept as a named module-level function rather than an inline `transform` arrow: compodoc 1.2.1
 * (the metadata source for the API contract and Storybook ArgTypes) hangs parsing an inline arrow
 * combined with explicit generic union type arguments on `input()`. A plain function reference sidesteps it.
 */
function coerceAutoHighlight(value: BooleanInput | 'always'): boolean | 'always' {
    return value === 'always' ? 'always' : booleanAttribute(value);
}

/**
 * Root of an Autocomplete — a text input with a filtered list of suggestions. Built on the combobox
 * engine with `selectionMode: 'none'`, so its value **is** the input string: typing, selecting an
 * item, or clearing all change a single string value. Owns input text, open state, filtering, inline
 * completion, and highlight-model navigation, and provides them to the combobox parts. Implements
 * `ControlValueAccessor` (the form value is the input string).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteRoot]',
    exportAs: 'rdxAutocompleteRoot',
    providers: [
        provideComboboxRootContext(context),
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxAutocompleteRoot, multi: true }
    ],
    hostDirectives: [RdxPopper],
    host: {
        '[attr.data-disabled]': 'disabledState() ? "" : undefined'
    }
})
export class RdxAutocompleteRoot implements ControlValueAccessor {
    private readonly injector = inject(Injector);

    /** The input text. This is the form value (controlled / uncontrolled via {@link defaultValue}). */
    readonly value = model<string>('');

    /** Initial input text when uncontrolled. */
    readonly defaultValue = input<string>();

    /** Whether the popup is open. */
    readonly open = model<boolean>(false);

    /** Initial open state when uncontrolled. */
    readonly defaultOpen = input(false, { transform: booleanAttribute });

    /** Filtering / inline-completion behavior. See {@link AutocompleteMode}. */
    readonly mode = input<AutocompleteMode>('list');

    /** Text direction. */
    readonly dir = input<Direction>('ltr');

    /** Whether the autocomplete is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /** Whether the autocomplete is read-only. */
    readonly readOnly = input(false, { alias: 'readOnly', transform: booleanAttribute });

    /** Whether a value is required (for forms). */
    readonly required = input(false, { transform: booleanAttribute });

    /** Whether keyboard navigation wraps at the list boundaries. */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    /**
     * Auto-highlight behavior (matches Base UI):
     * - `false` (default): never auto-highlight;
     * - `true` (also the bare `autoHighlight` attribute): highlight the first match as the query changes;
     * - `'always'`: keep the first navigable item highlighted whenever the popup is open.
     */
    readonly autoHighlight = input(false, { transform: coerceAutoHighlight });

    /** Resolved auto-highlight mode. */
    readonly autoHighlightMode = computed<'off' | 'input-change' | 'always'>(() => {
        const value = this.autoHighlight();
        if (value === 'always') {
            return 'always';
        }
        if (value === true) {
            return 'input-change';
        }
        return 'off';
    });

    /**
     * Whether moving the pointer over an item highlights it. `true` (default) paints `data-highlighted`
     * on hover; `false` suppresses hover-driven highlight entirely, letting CSS `:hover` stay distinct
     * from the `data-highlighted` (keyboard) state. Clicking an item still selects it.
     */
    readonly highlightItemOnHover = input(true, { transform: booleanAttribute });

    /**
     * Whether a pointer-driven highlight is kept when the cursor leaves the list. `false` (default)
     * clears the highlight on pointer-leave; `true` retains the last hovered item highlighted. Keyboard
     * navigation and auto-highlight are unaffected.
     */
    readonly keepHighlight = input(false, { transform: booleanAttribute });

    /** Whether clicking the input opens the popup. Defaults to `false` (Base UI default). */
    readonly openOnInputClick = input(false, { transform: booleanAttribute });

    /** Whether the popup is modal: locks page scroll and makes outside content inert while open. */
    readonly modal = input(false, { transform: booleanAttribute });

    /** Whether selecting an item requests submit of the closest form. */
    readonly submitOnItemClick = input(false, { transform: booleanAttribute });

    /** Whether the list is laid out as a 2D grid (enables row/column arrow navigation). */
    readonly grid = input(false, { transform: booleanAttribute });

    /**
     * Filter applied to items against the input query (only when {@link mode} is `'list'` / `'both'`).
     * - `undefined` (default): locale-aware "contains" via {@link useFilter};
     * - a function: custom matching;
     * - `null`: built-in filtering disabled (the consumer controls which items exist).
     */
    readonly filter = input<AutocompleteFilter | null | undefined>(undefined);

    /** Maximum number of matching items to show. `-1` (default) means no limit. */
    readonly limit = input(-1, { transform: numberAttribute });

    /**
     * The full set of item values, used as the source of truth for filtering and navigation in
     * {@link virtualized} mode (where only a window of `RdxAutocompleteItem` is mounted).
     */
    readonly items = input<readonly AcceptableValue[]>();

    /** Whether the list is externally virtualized (navigation runs over {@link items} by index). */
    readonly virtualized = input(false, { transform: booleanAttribute });

    /** How item values are compared for equality (function or object key). */
    readonly by = input<ItemValueComparator<AcceptableValue>>();

    /** Converts an item value to its string label (filter text + input text on selection). */
    readonly itemToStringValue = input<(value: AcceptableValue) => string>();

    /** Emits when the input value changes (typing, selection, or clear), with the reason. */
    readonly onValueChange = output<AutocompleteValueChangeDetails>();

    /** Emits when the popup opens or closes. */
    readonly onOpenChange = output<boolean>();

    /** Emits as the highlight moves, with the item's value, its index in {@link filteredItems}, and the reason. */
    readonly onItemHighlighted = output<ComboboxItemHighlightedDetails>();

    /** Emits after the open/close transition (including any exit animation) finishes. */
    readonly onOpenChangeComplete = output<boolean>();

    private readonly transition = useTransitionStatus((open) => this.onOpenChangeComplete.emit(open));

    /** Open/close transition phase, for `data-starting-style` / `data-ending-style`. */
    readonly transitionStatus = this.transition.status;

    /** Registers the popup element whose animation determines transition completion. */
    readonly registerTransitionElement = this.transition.registerElement;

    readonly listId = injectId('rdx-autocomplete-list-');

    readonly labelId = signal<string | undefined>(undefined);

    readonly inputElement = signal<HTMLInputElement | null>(null);

    /** Constant signals exposed to the combobox context (autocomplete is always single-value). */
    readonly alwaysFalse = signal(false);
    readonly noneMode = signal<'none'>('none');

    private readonly cvaDisabled = signal(false);
    readonly disabledState = computed(() => this.disabled() || this.cvaDisabled());
    readonly requiredState = computed(() => this.required());

    private readonly defaultFilter = useFilter();

    /** Whether built-in filtering applies in the current mode. */
    private readonly filteringMode = computed(() => this.mode() === 'list' || this.mode() === 'both');

    /** Whether inline completion applies in the current mode. */
    readonly inlineMode = computed(() => this.mode() === 'both' || this.mode() === 'inline');

    /**
     * Whether the input text is a fresh user query rather than a committed selection's label. While
     * `false` (just opened, or showing a committed selection), the list is unfiltered so the user can
     * browse; it flips `true` on the first keystroke.
     */
    private readonly typed = signal(false);

    /** The text the user actually typed, used as the filter query. */
    readonly query = computed(() => (this.typed() ? (this.value() ?? '') : ''));

    /** Transient inline-completion preview (the active item's label), or `null`. */
    readonly inlinePreview = signal<string | null>(null);

    /** What the input element displays: the inline preview if any, else the committed value. */
    readonly displayValue = computed(() => this.inlinePreview() ?? this.value() ?? '');

    /** Suppresses inline completion for the current edit (set while a delete key is pressed). */
    private suppressInline = false;

    private readonly _items = signal<readonly ComboboxItemRef[]>([]);

    /** Registered items, sorted into DOM order. */
    readonly orderedItems = computed(() => [...this._items()].sort((a, b) => domOrder(a.element, b.element)));

    /** Matching items in DOM order, capped at `limit`. The set of items the list shows. */
    readonly visibleItems = computed(() => {
        const matching = this.orderedItems().filter((item) => this.matchesFilter(item));
        const limit = this.limit();
        return limit >= 0 ? matching.slice(0, limit) : matching;
    });

    private readonly visibleSet = computed(() => new Set(this.visibleItems()));

    /** The filtered item values an external virtualizer should render. */
    readonly filteredItems = computed<readonly AcceptableValue[]>(() => {
        const data = this.items();
        if (data === undefined) {
            return this.visibleItems().map((item) => item.value());
        }
        const limit = this.limit();
        const cap = (arr: readonly AcceptableValue[]) => (limit >= 0 ? arr.slice(0, limit) : arr);

        if (!this.filteringMode()) {
            return cap(data);
        }
        const filter = this.filter();
        if (filter === null) {
            return cap(data);
        }
        const query = this.query();
        if (!query) {
            return cap(data);
        }
        const matcher = filter ?? this.defaultFilter.contains;
        return cap(data.filter((value) => matcher(this.textFor(value), query, value)));
    });

    readonly visibleCount = computed(() =>
        this.virtualized() ? this.filteredItems().length : this.visibleItems().length
    );

    readonly highlight = useListHighlight<ComboboxItemRef>({
        items: this.orderedItems,
        isNavigable: (item) => this.isVisible(item) && !item.disabled(),
        getId: (item) => item.id,
        loop: this.loopFocus,
        injector: this.injector
    });

    readonly highlightedItem = this.highlight.highlightedItem;

    /** Highlighted index into {@link filteredItems} in virtualized mode (`-1` when cleared). */
    readonly highlightedIndex = signal(-1);

    /** Why the highlight last moved; read when emitting {@link onItemHighlighted}. */
    private readonly highlightReason = signal<ComboboxHighlightReason>('none');

    readonly activeId = computed(() => {
        if (this.virtualized()) {
            const index = this.highlightedIndex();
            return index >= 0 ? this.itemId(index) : undefined;
        }
        return this.highlight.activeId();
    });

    /**
     * What to highlight once the list has mounted (items register asynchronously after opening):
     * an end edge, or `'first-match'` (the first item whose label starts with the query — used by
     * auto-highlight so inline completion lands on a real prefix match even when the list is static).
     */
    private readonly pendingHighlightEdge = signal<'first' | 'last' | 'first-match' | null>(null);

    private onChange?: (value: string) => void;
    private onTouched?: () => void;

    constructor() {
        // Apply uncontrolled defaults once.
        effect(() => {
            const initial = this.defaultValue();
            if (initial !== undefined && untracked(this.value) === '') {
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
            const index = this.highlightedIndex();
            if (!highlightInitialized) {
                highlightInitialized = true;
                return;
            }
            untracked(() => {
                const reason = this.highlightReason();
                if (this.virtualized()) {
                    const value = index >= 0 ? (this.filteredItems()[index] ?? null) : null;
                    this.onItemHighlighted.emit({ value, index, reason });
                } else {
                    const value = item ? item.value() : null;
                    const itemIndex = item ? this.visibleItems().indexOf(item) : -1;
                    this.onItemHighlighted.emit({ value, index: itemIndex, reason });
                }
            });
        });

        // Inline completion: mirror the active item's label into the input (with the completed suffix
        // selected by the input directive). Recomputes whenever the highlight or query changes.
        effect(() => {
            const item = this.highlightedItem();
            const query = this.query();
            const reason = this.highlightReason();
            untracked(() => this.recomputeInlinePreview(item, query, reason));
        });

        // Apply a deferred open-edge highlight once items (DOM refs) or filtered data have registered.
        effect(() => {
            const edge = this.pendingHighlightEdge();
            const count = this.virtualized() ? this.filteredItems().length : this.orderedItems().length;
            if (!this.open() || edge === null || count === 0) {
                return;
            }
            untracked(() => {
                this.highlightReason.set('none');
                if (this.virtualized()) {
                    this.highlightedIndex.set(this.resolveVirtualizedEdge(edge, count));
                } else if (edge === 'last') {
                    this.highlight.last();
                } else if (edge === 'first-match') {
                    this.highlight.set(this.firstMatchItem() ?? this.firstVisibleNavigable());
                } else {
                    this.highlight.first();
                }
                this.pendingHighlightEdge.set(null);
            });
        });

        // autoHighlight 'always': keep the first navigable item highlighted whenever the popup is open.
        effect(() => {
            this.orderedItems();
            this.visibleCount();
            if (this.autoHighlightMode() === 'always' && this.open()) {
                untracked(() => {
                    if (this.virtualized()) {
                        const length = this.filteredItems().length;
                        const index = this.highlightedIndex();
                        if ((index < 0 || index >= length) && length > 0) {
                            this.highlightReason.set('none');
                            this.highlightedIndex.set(0);
                        }
                    } else if (this.highlightedItem() === null) {
                        this.highlightReason.set('none');
                        this.highlight.first();
                    }
                });
            }
        });

        // Virtualized self-heal: clear a highlight that filtering pushed out of range.
        effect(() => {
            if (!this.virtualized()) {
                return;
            }
            const length = this.filteredItems().length;
            untracked(() => {
                const index = this.highlightedIndex();
                if (index >= length && index !== -1) {
                    this.highlightReason.set('none');
                    this.highlightedIndex.set(-1);
                }
            });
        });

        // Virtualized object values can't be labelled from the DOM — warn once in dev.
        if (isDevMode()) {
            effect(() => {
                if (!this.virtualized() || this.itemToStringValue()) {
                    return;
                }
                if (this.items()?.some((value) => value !== null && typeof value === 'object')) {
                    rdxDevWarning(
                        'autocomplete/virtualized-item-label',
                        '`rdxAutocompleteRoot` `virtualized` with object item values needs `itemToStringValue` ' +
                            'to render correct labels; falling back to a generic label.',
                        'components/autocomplete'
                    );
                }
            });
        }
    }

    private recomputeInlinePreview(item: ComboboxItemRef | null, query: string, reason: ComboboxHighlightReason): void {
        // Pointer hover must not rewrite the input (matches Base UI); only typing / keyboard nav complete it.
        if (!this.inlineMode() || this.suppressInline || !item || reason === 'pointer') {
            this.inlinePreview.set(null);
            return;
        }
        const label = item.textValue();
        if (label && query && label.toLowerCase().startsWith(query.toLowerCase())) {
            // Type-ahead: keep the typed prefix (preserving its casing) and complete the rest.
            this.inlinePreview.set(query + label.slice(query.length));
            return;
        }
        // Keyboard navigation to an item that doesn't prefix-match the query: show its full label so the
        // input reflects the highlighted option. Typing (reason 'none') never jumps to a non-prefix label.
        if (reason === 'keyboard' && label) {
            this.inlinePreview.set(label);
            return;
        }
        this.inlinePreview.set(null);
    }

    setSuppressInline(value: boolean): void {
        this.suppressInline = value;
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
        if (!this.filteringMode()) {
            return true;
        }
        const filter = this.filter();
        if (filter === null) {
            return true;
        }
        const query = this.query();
        const matcher = filter ?? this.defaultFilter.contains;
        return matcher(item.textValue(), query, item.value());
    }

    /** Whether the item is shown in the list (matches the query and is within `limit`). */
    isVisible(item: ComboboxItemRef): boolean {
        return this.visibleSet().has(item);
    }

    /** The first visible, navigable item whose label starts with the query (for inline completion). */
    private firstMatchItem(): ComboboxItemRef | null {
        const query = this.query();
        if (!query) {
            return null;
        }
        const lower = query.toLowerCase();
        return (
            this.visibleItems().find((item) => !item.disabled() && item.textValue().toLowerCase().startsWith(lower)) ??
            null
        );
    }

    /** The first visible, navigable item (auto-highlight fallback when no prefix match exists). */
    private firstVisibleNavigable(): ComboboxItemRef | null {
        return this.visibleItems().find((item) => !item.disabled()) ?? null;
    }

    /** Resolves a pending edge to a virtualized index. */
    private resolveVirtualizedEdge(edge: 'first' | 'last' | 'first-match', count: number): number {
        if (edge === 'last') {
            return count - 1;
        }
        if (edge === 'first-match') {
            const query = this.query();
            if (query) {
                const lower = query.toLowerCase();
                const index = this.filteredItems().findIndex((value) =>
                    this.textFor(value).toLowerCase().startsWith(lower)
                );
                if (index >= 0) {
                    return index;
                }
            }
        }
        return 0;
    }

    private keyboardActive = false;
    isKeyboardActive(): boolean {
        return this.keyboardActive;
    }
    setKeyboardActive(value: boolean): void {
        this.keyboardActive = value;
    }

    /** Whether the item's value/label matches the current input value (combobox context contract). */
    isSelectedValue(value: AcceptableValue): boolean {
        const current = this.value();
        if (!current) {
            return false;
        }
        return value === current || isItemEqualToValue(value, current, this.by());
    }

    registerItem(item: ComboboxItemRef): void {
        this._items.update((items) => [...items, item]);
    }

    unregisterItem(item: ComboboxItemRef): void {
        this._items.update((items) => items.filter((i) => i !== item));
    }

    setOpen(open: boolean): void {
        if (this.disabledState() || this.readOnly()) {
            return;
        }
        this.open.set(open);
    }

    closePopup(revert = true): void {
        if (!this.open()) {
            return;
        }
        this.open.set(false);
        this.clearHighlightState();
        this.inlinePreview.set(null);
        if (revert) {
            this.typed.set(false);
        }
        this.markAsTouched();
    }

    /** Updates the input text from user typing (marks it a fresh query, emits change). */
    setQuery(value: string): void {
        this.commitValue(value, 'input-change');
        this.typed.set(true);
        // Inline modes (`both` / `inline`) implicitly highlight the first prefix match so the input can
        // be inline-completed even without an explicit `autoHighlight`.
        if (this.autoHighlightMode() !== 'off' || (this.inlineMode() && value.length > 0)) {
            this.pendingHighlightEdge.set('first-match');
        }
    }

    /** Selects all input text so the next keystroke replaces a committed label. */
    selectInputText(): void {
        this.inputElement()?.select();
    }

    labelFor(value: AcceptableValue): string {
        const custom = this.itemToStringValue();
        if (custom) {
            return custom(value);
        }
        const item = this.orderedItems().find((i) => isItemEqualToValue(i.value(), value, this.by()));
        return item ? item.textValue() : defaultItemToStringLabel(value);
    }

    /** Label text for a raw item value (virtualized mode, no DOM element to read from). */
    private textFor(value: AcceptableValue): string {
        const custom = this.itemToStringValue();
        return custom ? custom(value) : defaultItemToStringLabel(value);
    }

    /** Deterministic id for the item at `index` in virtualized mode (matches `aria-activedescendant`). */
    itemId(index: number): string {
        return `${this.listId}-item-${index}`;
    }

    handleSelect(item: ComboboxItemRef): void {
        if (this.disabledState() || this.readOnly() || item.disabled()) {
            return;
        }
        this.commitSelection(item.textValue() || this.labelFor(item.value()));
    }

    /** Selects the filtered item at `index` (virtualized mode). */
    selectIndex(index: number): void {
        if (this.disabledState() || this.readOnly()) {
            return;
        }
        const value = this.filteredItems()[index];
        if (value === undefined) {
            return;
        }
        this.commitSelection(this.labelFor(value));
    }

    /** Commits a selection: the input value becomes the item's label, the popup closes. */
    private commitSelection(label: string): void {
        this.inlinePreview.set(null);
        this.commitValue(label, 'item-press');
        this.typed.set(false);
        this.open.set(false);
        this.clearHighlightState();
        this.restoreFocusAfterSelect();
        this.maybeSubmit();
    }

    private maybeSubmit(): void {
        if (this.submitOnItemClick()) {
            this.inputElement()?.form?.requestSubmit?.();
        }
    }

    selectHighlighted(): void {
        if (this.virtualized()) {
            const index = this.highlightedIndex();
            if (index >= 0) {
                this.selectIndex(index);
            }
            return;
        }
        const item = this.highlightedItem();
        if (item) {
            this.handleSelect(item);
        }
    }

    // --- Highlight navigation facade (mode-aware: index-based when virtualized, grid-aware, else DOM-ref) ---

    moveDown(): void {
        this.highlightReason.set('keyboard');
        if (this.virtualized()) {
            this.stepIndex(1);
        } else if (this.grid()) {
            this.gridVertical(1);
        } else {
            this.highlight.next();
        }
    }

    moveUp(): void {
        this.highlightReason.set('keyboard');
        if (this.virtualized()) {
            this.stepIndex(-1);
        } else if (this.grid()) {
            this.gridVertical(-1);
        } else {
            this.highlight.previous();
        }
    }

    /** Grid: move to the next cell in DOM order. Non-grid: no-op (caret movement). */
    moveRight(): void {
        if (!this.grid() || this.virtualized()) {
            return;
        }
        this.highlightReason.set('keyboard');
        this.highlight.next();
    }

    moveLeft(): void {
        if (!this.grid() || this.virtualized()) {
            return;
        }
        this.highlightReason.set('keyboard');
        this.highlight.previous();
    }

    highlightFirst(reason: ComboboxHighlightReason = 'keyboard'): void {
        this.highlightReason.set(reason);
        if (this.virtualized()) {
            this.highlightedIndex.set(this.filteredItems().length > 0 ? 0 : -1);
        } else {
            this.highlight.first();
        }
    }

    highlightLast(reason: ComboboxHighlightReason = 'keyboard'): void {
        this.highlightReason.set(reason);
        if (this.virtualized()) {
            const length = this.filteredItems().length;
            this.highlightedIndex.set(length > 0 ? length - 1 : -1);
        } else {
            this.highlight.last();
        }
    }

    highlightIndex(index: number, reason: ComboboxHighlightReason): void {
        if (index < 0 || index >= this.filteredItems().length) {
            return;
        }
        this.highlightReason.set(reason);
        this.highlightedIndex.set(index);
    }

    setHighlight(item: ComboboxItemRef, reason: ComboboxHighlightReason): void {
        this.highlightReason.set(reason);
        this.highlight.set(item);
    }

    clearHighlightState(): void {
        this.highlight.clear();
        this.highlightedIndex.set(-1);
    }

    private stepIndex(direction: 1 | -1): void {
        const length = this.filteredItems().length;
        if (length === 0) {
            this.highlightedIndex.set(-1);
            return;
        }
        const current = this.highlightedIndex();
        if (current < 0) {
            this.highlightedIndex.set(direction === 1 ? 0 : length - 1);
            return;
        }
        let next = current + direction;
        const loop = this.loopFocus();
        if (next < 0) {
            next = loop ? length - 1 : 0;
        } else if (next >= length) {
            next = loop ? 0 : length - 1;
        }
        this.highlightedIndex.set(next);
    }

    /** Grid vertical move: keep the column index, jump to the adjacent row. */
    private gridVertical(direction: 1 | -1): void {
        const rows = this.gridRows();
        if (rows.length === 0) {
            return;
        }
        const current = this.highlightedItem();
        if (!current) {
            const row = direction === 1 ? rows[0] : rows[rows.length - 1];
            this.highlight.set(row[0] ?? null);
            return;
        }
        let rowIndex = rows.findIndex((row) => row.includes(current));
        const col = rowIndex >= 0 ? rows[rowIndex].indexOf(current) : 0;
        const loop = this.loopFocus();
        rowIndex += direction;
        if (rowIndex < 0) {
            rowIndex = loop ? rows.length - 1 : 0;
        } else if (rowIndex >= rows.length) {
            rowIndex = loop ? 0 : rows.length - 1;
        }
        const targetRow = rows[rowIndex];
        this.highlight.set(targetRow[Math.min(col, targetRow.length - 1)] ?? null);
    }

    /** Visible items grouped into rows by their nearest `[rdxAutocompleteRow]` ancestor (DOM order). */
    private gridRows(): ComboboxItemRef[][] {
        const rows = new Map<Element | null, ComboboxItemRef[]>();
        for (const item of this.visibleItems()) {
            const key = item.element.closest('[rdxAutocompleteRow]');
            const bucket = rows.get(key);
            if (bucket) {
                bucket.push(item);
            } else {
                rows.set(key, [item]);
            }
        }
        return [...rows.values()];
    }

    clearValue(): void {
        this.commitValue('', 'input-clear');
        this.typed.set(true);
        this.inlinePreview.set(null);
        this.focusInput();
    }

    /** The trigger element, used as a focus fallback when the input lives inside the popup. */
    triggerElement: HTMLElement | null = null;

    focusInput(): void {
        this.inputElement()?.focus();
    }

    restoreFocusAfterSelect(): void {
        const input = this.inputElement();
        if (input && !input.closest('[rdxAutocompletePopup]')) {
            input.focus();
        } else {
            this.triggerElement?.focus();
        }
    }

    markAsTouched(): void {
        this.onTouched?.();
    }

    private commitValue(value: string, reason: AutocompleteChangeReason): void {
        this.value.set(value);
        this.onValueChange.emit({ value, reason });
        this.onChange?.(value);
    }

    // ControlValueAccessor (the form value is the input string)
    writeValue(value: string | null): void {
        untracked(() => this.value.set(value ?? ''));
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.cvaDisabled.set(isDisabled);
    }
}

/** DOM-order comparator for two elements (precedes → -1, follows → 1). */
function domOrder(a: HTMLElement, b: HTMLElement): number {
    const position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
    }
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
    }
    return 0;
}
