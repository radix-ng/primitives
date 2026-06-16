import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
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
    AcceptableValue,
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    createFloatingRootContext,
    itemToStringLabel as defaultItemToStringLabel,
    Direction,
    isNullish,
    isItemEqualToValue as itemsEqual,
    ItemValueComparator,
    provideFloatingRootContext,
    provideFloatingTree,
    RdxCancelableChangeEventDetails,
    RdxFloatingRootContext
} from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';
import {
    ComboboxEngine,
    ComboboxFilter,
    ComboboxHighlightReason,
    ComboboxInputLayout,
    ComboboxItemHighlightedDetails,
    ComboboxItemRef,
    useComboboxEngine
} from './combobox-engine';

/** The value a combobox can hold: a single value, an array (multiple mode), or nothing. */
export type ComboboxValue = AcceptableValue | AcceptableValue[];

export type RdxComboboxOpenChangeReason =
    | 'trigger-press'
    | 'input-press'
    | 'list-navigation'
    | 'input-change'
    | 'input-clear'
    | 'item-press'
    | 'outside-press'
    | 'focus-out'
    | 'escape-key'
    | 'close-press'
    | 'cancel-open'
    | 'none';

export type RdxComboboxOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxComboboxOpenChangeReason>;

export interface RdxComboboxOpenChange {
    open: boolean;
    reason: RdxComboboxOpenChangeReason;
    event: Event;
    trigger: HTMLElement | undefined;
    eventDetails: RdxComboboxOpenChangeEventDetails;
}

interface RdxComboboxOpenChangeTransaction {
    payload: RdxComboboxOpenChange;
    eventDetails: RdxComboboxOpenChangeEventDetails;
    shouldPreventUnmountOnClose: () => boolean;
}

// Re-exported so consumers (and the autocomplete engine bridge) keep importing these from the
// combobox entry point; the definitions now live with the shared engine.
export type {
    ComboboxFilter,
    ComboboxHighlightReason,
    ComboboxInputLayout,
    ComboboxItemHighlightedDetails,
    ComboboxItemRef
};

// The engine stays private to the root (it owns mutable internals); the context factory — a free
// function, so it can't reach a `private` field — reads it through this registry instead.
const engineRegistry = new WeakMap<RdxComboboxRoot, ComboboxEngine>();

const context = () => {
    const root = inject(RdxComboboxRoot);
    const engine = engineRegistry.get(root)!;
    return {
        listId: engine.listId,
        labelId: engine.labelId,
        setLabelId: (id: string | undefined) => engine.setLabelId(id),
        dir: root.dir,
        value: root.value,
        inputValue: root.inputValue,
        open: root.open,
        present: root.present,
        multiple: root.multiple,
        selectionMode: root.mode,
        disabledState: root.disabledState,
        readonly: root.readOnly,
        requiredState: root.requiredState,
        openOnInputClick: root.openOnInputClick,
        modal: root.modal,
        virtualized: root.virtualized,
        grid: root.grid,
        filteredItems: engine.filteredItems,
        highlightedItem: engine.highlightedItem,
        highlightedIndex: engine.highlightedIndex,
        activeId: engine.activeId,
        itemId: (index: number) => engine.itemId(index),
        isKeyboardActive: () => engine.isKeyboardActive(),
        setKeyboardActive: (value: boolean) => engine.setKeyboardActive(value),
        transitionStatus: engine.transitionStatus,
        registerTransitionElement: engine.registerTransitionElement,
        visibleCount: engine.visibleCount,
        isVisible: (item: ComboboxItemRef) => engine.isVisible(item),
        isSelected: (value: AcceptableValue) => root.isSelected(value),
        registerItem: (item: ComboboxItemRef) => engine.registerItem(item),
        unregisterItem: (item: ComboboxItemRef) => engine.unregisterItem(item),
        highlight: engine.highlight,
        highlightNext: () => engine.highlightNext('keyboard'),
        highlightPrevious: () => engine.highlightPrevious('keyboard'),
        highlightNextColumn: () => engine.highlightNextColumn('keyboard'),
        highlightPreviousColumn: () => engine.highlightPreviousColumn('keyboard'),
        highlightFirst: () => engine.highlightFirst('keyboard'),
        highlightLast: () => engine.highlightLast('keyboard'),
        highlightIndex: (index: number, reason: ComboboxHighlightReason) => engine.highlightIndex(index, reason),
        setHighlight: (item: ComboboxItemRef, reason: ComboboxHighlightReason) => engine.setHighlight(item, reason),
        clearHighlight: () => engine.clearHighlightState(),
        highlightItemOnHover: root.highlightItemOnHover,
        keepHighlight: root.keepHighlight,
        inputElement: engine.inputElement,
        setInputElement: (el: HTMLInputElement | null) => engine.setInputElement(el),
        inputLayout: engine.inputLayout,
        setInputLayout: (layout: ComboboxInputLayout) => engine.setInputLayout(layout),
        openedByTouch: engine.openedByTouch,
        setOpenedByTouch: (value: boolean) => engine.setOpenedByTouch(value),
        popupMounted: engine.popupMounted,
        setPopupMounted: (value: boolean) => engine.setPopupMounted(value),
        registerTrigger: (el: HTMLElement | null) => engine.setTrigger(el),
        focusInput: () => engine.focusInput(),
        openPopup: (reason?: RdxComboboxOpenChangeReason, event?: Event) => root.setOpen(true, reason, event),
        openForBrowse: (reason?: RdxComboboxOpenChangeReason, event?: Event) => root.openForBrowse(reason, event),
        closePopup: (revert = true, reason?: RdxComboboxOpenChangeReason, event?: Event) =>
            root.closePopup(revert, reason, event),
        setInputValue: (value: string) => root.setInputValue(value),
        openAndHighlight: (edge: 'first' | 'last', reason?: RdxComboboxOpenChangeReason, event?: Event) =>
            root.openAndHighlight(edge, reason, event),
        navigateByKeyboard: (direction: 1 | -1, event?: Event) => root.navigateByKeyboard(direction, event),
        select: (item: ComboboxItemRef, event?: Event) => root.handleSelect(item, event),
        selectIndex: (index: number, event?: Event) => root.selectIndex(index, event),
        selectHighlighted: (event?: Event) => root.selectHighlighted(event),
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

export const [injectComboboxRootContext, provideComboboxRootContext] = createContext<RdxComboboxRootContext>(
    'RdxComboboxRootContext',
    'components/combobox'
);

/**
 * `autoHighlight` transform: pass the `'always'` / `'input-change'` string modes through verbatim,
 * coerce everything else as a boolean attribute (so the bare `autoHighlight` attribute reads `true`).
 *
 * Kept as a named module-level function rather than an inline `transform` arrow: compodoc 1.2.1
 * (the metadata source for the API contract and Storybook ArgTypes) hangs parsing an inline arrow
 * combined with explicit generic union type arguments on `input()`. A plain function reference sidesteps it.
 */
function coerceAutoHighlight(value: BooleanInput | 'always' | 'input-change'): boolean | 'always' | 'input-change' {
    return value === 'always' || value === 'input-change' ? value : booleanAttribute(value);
}

/**
 * Root of a Combobox — a filterable select. Owns selection, input text, open state, and the forms
 * integration, and delegates filtering / highlight-model navigation / the open-close transition to the
 * shared {@link useComboboxEngine} (ADR 0014). Exposes everything to the parts through
 * {@link RdxComboboxRootContext}. Implements `ControlValueAccessor`.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxRoot]',
    exportAs: 'rdxComboboxRoot',
    providers: [
        provideComboboxRootContext(context),
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxComboboxRoot, multi: true },
        // New floating foundation (ADR 0015/0017) — the dismissal capability reads this shared context.
        provideFloatingTree(),
        provideFloatingRootContext(() => inject(RdxComboboxRoot).floatingContext)
    ],
    hostDirectives: [RdxPopper],
    host: {
        '[attr.data-disabled]': 'disabledState() ? "" : undefined'
    }
})
export class RdxComboboxRoot implements ControlValueAccessor {
    private readonly injector = inject(Injector);

    /** Per-popup floating root context (ADR 0015) — `open` / `triggers` / reference for the dismissal engine. */
    readonly floatingContext: RdxFloatingRootContext = createFloatingRootContext({
        ownerDocument: inject(ElementRef).nativeElement.ownerDocument,
        open: () => this.open()
    });

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

    /** Whether the combobox is read-only. Base UI prop name. */
    readonly readOnly = input(false, { transform: booleanAttribute });

    /** Whether a value is required (for forms). */
    readonly required = input(false, { transform: booleanAttribute });

    /** Whether keyboard navigation wraps at the list boundaries. */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    /**
     * Auto-highlight behavior:
     * - `false` (default): never auto-highlight;
     * - `true` (also the bare `autoHighlight` attribute) / `'input-change'`: highlight the first match as the query changes;
     * - `'always'`: keep the first navigable item highlighted whenever the popup is open.
     */
    readonly autoHighlight = input(false, { transform: coerceAutoHighlight });

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

    /**
     * The full set of item values, used as the source of truth for filtering and navigation in
     * {@link virtualized} mode (where only a window of `RdxComboboxItem` is mounted). The filtered
     * subset is exposed as {@link filteredItems} for an external virtualizer to render.
     */
    readonly items = input<readonly AcceptableValue[]>();

    /**
     * Whether the list is externally virtualized — only a window of items is rendered, so navigation
     * runs over {@link items}/{@link filteredItems} by index instead of over mounted DOM elements.
     * Requires {@link items}, and {@link itemToStringLabel} for selection labels/filter text. Disabled
     * items outside the rendered window are not skipped by keyboard navigation.
     */
    readonly virtualized = input(false, { transform: booleanAttribute });

    /**
     * Whether the list is laid out as a 2D grid: `ArrowUp`/`ArrowDown` move between rows (keeping the
     * column), `ArrowLeft`/`ArrowRight` move within a row. Wrap items in `RdxComboboxRow`; the list
     * switches to `role="grid"`. Not supported together with {@link virtualized}.
     */
    readonly grid = input(false, { transform: booleanAttribute });

    /** How item values are compared for equality (a comparator function or an object key). Base UI prop name. */
    readonly isItemEqualToValue = input<ItemValueComparator<AcceptableValue>>();

    /** Converts a value to its display label. Defaults to the matching item's text. */
    readonly itemToStringLabel = input<(value: AcceptableValue) => string>();

    /** Emits when the selection changes. */
    readonly onValueChange = output<ComboboxValue | null>();

    /** Emits when the input text changes. */
    readonly onInputValueChange = output<string>();

    /** Emits when the popup opens or closes. */
    readonly onOpenChange = output<RdxComboboxOpenChange>();

    /**
     * Emits as the highlight moves, with the item's value, its index in {@link filteredItems}, and the
     * reason. In virtualized mode, use `index` to call the virtualizer's `scrollToIndex`.
     */
    readonly onItemHighlighted = output<ComboboxItemHighlightedDetails>();

    /** Emits after the open/close transition (including any exit animation) finishes. */
    readonly onOpenChangeComplete = output<boolean>();

    private readonly cvaDisabled = signal(false);
    readonly disabledState = computed(() => this.disabled() || this.cvaDisabled());
    readonly requiredState = computed(() => this.required());
    private readonly preventUnmountOnClose = signal(false);
    readonly present = computed(() => this.open() || this.preventUnmountOnClose());

    /**
     * Whether the input text is a fresh user query rather than the current selection's label. While
     * `false` (just opened, or showing a selected label), the list is unfiltered so the user can
     * browse; it flips `true` on the first keystroke.
     */
    private readonly typed = signal(false);

    /** The active query: the typed text once the user starts typing, otherwise empty (browse mode). */
    private readonly query = computed(() => (this.typed() ? (this.inputValue() ?? '') : ''));

    /** Built-in filtering always applies for combobox (the `none` filter is handled inside the engine). */
    private readonly filteringEnabled = signal(true);

    /** Combobox never inline-completes (that's an autocomplete mode). */
    private readonly noInline = signal(false);

    /** The shared engine: item registry, filtering, highlight navigation, and the open-close transition. */
    private readonly engine: ComboboxEngine = useComboboxEngine({
        injector: this.injector,
        listIdPrefix: 'rdx-combobox-list-',
        popupSelector: '[rdxComboboxPopup]',
        open: this.open,
        query: this.query,
        filteringEnabled: this.filteringEnabled,
        loopFocus: this.loopFocus,
        autoHighlightMode: this.autoHighlightMode,
        virtualized: this.virtualized,
        items: this.items,
        filter: this.filter,
        limit: this.limit,
        grid: this.grid,
        rowOf: (element) => element.closest('[rdxComboboxRow]'),
        inlineMode: this.noInline,
        itemToString: (value) => this.labelFor(value),
        onItemHighlighted: (details) => this.onItemHighlighted.emit(details),
        onOpenChange: () => {},
        onOpenChangeComplete: (open) => this.onOpenChangeComplete.emit(open)
    });

    /** The list element id referenced by `aria-controls` / `aria-activedescendant` (engine-backed). */
    get listId() {
        return this.engine.listId;
    }

    /** The currently highlighted item (engine-backed; read by parts and tests). */
    get highlightedItem() {
        return this.engine.highlightedItem;
    }

    /** Number of items the list currently shows (engine-backed). */
    get visibleCount() {
        return this.engine.visibleCount;
    }

    /** The filtered item values an external virtualizer should render (engine-backed). */
    get filteredItems() {
        return this.engine.filteredItems;
    }

    /** Highlighted index into {@link filteredItems} in virtualized mode (engine-backed). */
    get highlightedIndex() {
        return this.engine.highlightedIndex;
    }

    /** The active option's id for `aria-activedescendant` (engine-backed). */
    get activeId() {
        return this.engine.activeId;
    }

    private onChange?: (value: ComboboxValue | null) => void;
    private onTouched?: () => void;

    constructor() {
        // Expose the (private) engine to the context factory, which is a free function.
        engineRegistry.set(this, this.engine);

        // Keep the dismissal reference in sync with the input (the anchor) so a press / focus on it counts
        // as "inside" and never dismisses (ADR 0015).
        effect(() => this.floatingContext.setReferenceElement(this.engine.inputElement() ?? null));

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

        // Virtualized object values can't be labelled from the DOM (items aren't registered) — without
        // `itemToStringLabel`, selection/revert fall back to a generic label. Warn once in dev.
        if (isDevMode()) {
            let warned = false;
            effect(() => {
                if (warned || !this.virtualized() || this.itemToStringLabel()) {
                    return;
                }
                if (this.items()?.some((value) => value !== null && typeof value === 'object')) {
                    warned = true;
                    console.warn(
                        '[rdxComboboxRoot] `virtualized` with object item values needs `itemToStringLabel` ' +
                            'to render correct selection labels; falling back to a generic label.'
                    );
                }
            });
        }
    }

    /** Opens the popup for browsing (resets the query to "pristine" and selects the input text). */
    openForBrowse(
        reason: RdxComboboxOpenChangeReason = 'none',
        event: Event = new Event('combobox.open-change')
    ): void {
        if (!this.open()) {
            this.typed.set(false);
        }
        this.setOpen(true, reason, event);
        this.engine.selectInputText();
        if (this.autoHighlightMode() === 'always') {
            this.engine.setPendingHighlightEdge('first');
        }
    }

    /** Opens the popup and highlights the given edge once the list mounts. */
    openAndHighlight(
        edge: 'first' | 'last',
        reason: RdxComboboxOpenChangeReason = 'list-navigation',
        event: Event = new Event('combobox.open-change')
    ): void {
        if (!this.open()) {
            this.typed.set(false);
        }
        this.setOpen(true, reason, event);
        this.engine.selectInputText();
        this.engine.setPendingHighlightEdge(edge);
    }

    /**
     * Keyboard list navigation shared by the input and the chips: opens the popup and highlights the
     * leading/trailing edge when closed, otherwise steps the highlight. `direction` is `1` (down) or
     * `-1` (up). Centralized so the input and chip key handlers can't drift apart.
     */
    navigateByKeyboard(direction: 1 | -1, event: Event = new Event('combobox.open-change')): void {
        this.engine.setKeyboardActive(true);
        if (!this.open()) {
            this.openAndHighlight(direction === 1 ? 'first' : 'last', 'list-navigation', event);
        } else if (direction === 1) {
            this.engine.highlightNext();
        } else {
            this.engine.highlightPrevious();
        }
    }

    isSelected(value: AcceptableValue): boolean {
        if (this.mode() === 'none') {
            return false;
        }
        const current = this.value();
        if (this.multiple()) {
            return Array.isArray(current) && current.some((v) => itemsEqual(v, value, this.isItemEqualToValue()));
        }
        return !isNullish(current) && itemsEqual(current as AcceptableValue, value, this.isItemEqualToValue());
    }

    setOpen(
        open: boolean,
        reason: RdxComboboxOpenChangeReason = 'none',
        event: Event = new Event('combobox.open-change')
    ): boolean {
        if (open === this.open()) {
            return true;
        }

        if (open && (this.disabledState() || this.readOnly())) {
            return false;
        }

        const change = this.createOpenChangeEvent(open, reason, event);
        this.onOpenChange.emit(change.payload);

        if (change.eventDetails.isCanceled()) {
            return false;
        }

        this.preventUnmountOnClose.set(open ? false : change.shouldPreventUnmountOnClose());
        this.open.set(open);
        return true;
    }

    closePopup(
        revert = true,
        reason: RdxComboboxOpenChangeReason = 'none',
        event: Event = new Event('combobox.open-change')
    ): void {
        if (!this.open()) {
            return;
        }

        if (!this.setOpen(false, reason, event)) {
            return;
        }

        this.engine.clearHighlightState();
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
        // Base UI: emptying the field clears a single selection — but only when the input is OUTSIDE the
        // popup. With the input inside the popup, the search box and the committed value are independent,
        // so clearing the search must not deselect. (multiple keeps its chips; `none` has no committed
        // value.) The guarded `commitValue` is a no-op when read-only / disabled.
        if (
            value === '' &&
            this.mode() === 'single' &&
            !isNullish(this.value()) &&
            this.engine.inputLayout() !== 'inside'
        ) {
            this.commitValue(null);
        }
        // Auto-highlight the first match as the query changes (deferred so it lands after items mount).
        if (this.autoHighlightMode() !== 'off') {
            this.engine.setPendingHighlightEdge('first');
        }
    }

    /** Sets the input text programmatically (a selection label / revert) — not a user query. */
    private setLabel(value: string): void {
        this.inputValue.set(value);
        this.typed.set(false);
        this.onInputValueChange.emit(value);
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
        const item = this.engine.orderedItems().find((i) => itemsEqual(i.value(), value, this.isItemEqualToValue()));
        return item ? item.textValue() : defaultItemToStringLabel(value);
    }

    handleSelect(item: ComboboxItemRef, event: Event = new Event('combobox.item-press')): void {
        if (this.disabledState() || this.readOnly() || item.disabled()) {
            return;
        }
        this.handleSelectValue(item.value(), item.textValue() || this.labelFor(item.value()), event);
    }

    /** Selects the filtered item at `index` (virtualized mode). The label comes from {@link labelFor}. */
    selectIndex(index: number, event: Event = new Event('combobox.item-press')): void {
        if (this.disabledState() || this.readOnly()) {
            return;
        }
        const value = this.engine.filteredItems()[index];
        if (value === undefined) {
            return;
        }
        this.handleSelectValue(value, this.labelFor(value), event);
    }

    /** Commits a selection from a resolved value/label, independent of whether a DOM item exists. */
    private handleSelectValue(
        value: AcceptableValue,
        textValue: string,
        event: Event = new Event('combobox.item-press')
    ): void {
        // Capture focus *before* emitting `onValueChange` so focus restoration can be skipped when the
        // consumer moves focus in that callback (e.g. focusing an external field after an emoji press).
        const activeBefore = typeof document !== 'undefined' ? document.activeElement : null;

        if (this.mode() === 'none') {
            // No value is committed; `onValueChange` fires as a pointer/keyboard activation signal so
            // command-palette consumers can react. Optionally fill the input, then close.
            this.onValueChange.emit(value);
            if (this.fillInputOnItemPress()) {
                this.setLabel(textValue);
            }
            this.closePopup(false, 'item-press', event);
            this.engine.restoreFocusAfterSelect(activeBefore);
            this.maybeSubmit();
            return;
        }

        if (this.multiple()) {
            const current = Array.isArray(this.value()) ? [...(this.value() as AcceptableValue[])] : [];
            const index = current.findIndex((v) => itemsEqual(v, value, this.isItemEqualToValue()));
            if (index === -1) {
                current.push(value);
            } else {
                current.splice(index, 1);
            }
            this.commitValue(current);
            this.setLabel('');
            // Keep the input focused for adding more values — unless the consumer moved focus.
            if (typeof document === 'undefined' || document.activeElement === activeBefore) {
                this.engine.focusInput();
            }
        } else {
            this.commitValue(value);
            this.setLabel(textValue);
            this.closePopup(false, 'item-press', event);
            this.engine.restoreFocusAfterSelect(activeBefore);
        }

        this.maybeSubmit();
    }

    /** Requests submit of the closest form when `submitOnItemClick` is enabled. */
    private maybeSubmit(): void {
        if (this.submitOnItemClick()) {
            this.engine.inputElement()?.form?.requestSubmit?.();
        }
    }

    selectHighlighted(event: Event = new Event('combobox.item-press')): void {
        if (this.virtualized()) {
            const index = this.engine.highlightedIndex();
            if (index >= 0) {
                this.selectIndex(index, event);
            }
            return;
        }
        const item = this.engine.highlightedItem();
        if (item) {
            this.handleSelect(item, event);
        }
    }

    clearSelection(): void {
        // Read-only / disabled comboboxes are not user-mutable (Base UI blocks Clear here too).
        if (this.disabledState() || this.readOnly()) {
            return;
        }
        // In `none` mode there is no committed value to clear — only the input text. Otherwise reset
        // the selection. Also drop any highlight (Base UI resets the active/selected indices here).
        if (this.mode() !== 'none') {
            this.commitValue(this.multiple() ? [] : null);
        }
        this.setLabel('');
        this.engine.clearHighlightState();
        this.engine.focusInput();
    }

    removeValue(value: AcceptableValue): void {
        if (!this.multiple() || !Array.isArray(this.value())) {
            return;
        }
        const next = (this.value() as AcceptableValue[]).filter(
            (v) => !itemsEqual(v, value, this.isItemEqualToValue())
        );
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

    focusInput(): void {
        this.engine.focusInput();
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

    /**
     * The single guarded value-mutation point for all user-driven changes (selection toggle, Clear,
     * chip removal, Backspace). Read-only / disabled comboboxes never mutate here — programmatic form
     * writes go through {@link writeValue}, which is intentionally not guarded. (ADR 0014, Finding 1.)
     */
    private commitValue(value: ComboboxValue | null): void {
        if (this.disabledState() || this.readOnly()) {
            return;
        }
        this.value.set(value);
        this.onValueChange.emit(value);
        this.onChange?.(value);
    }

    private createOpenChangeEvent(
        open: boolean,
        reason: RdxComboboxOpenChangeReason,
        event: Event
    ): RdxComboboxOpenChangeTransaction {
        const change = createCancelableChangeEventDetails(reason, event, this.resolveOpenChangeTrigger(event));

        return {
            payload: {
                open,
                reason,
                event: change.eventDetails.event,
                trigger: change.eventDetails.trigger,
                eventDetails: change.eventDetails
            },
            eventDetails: change.eventDetails,
            shouldPreventUnmountOnClose: change.shouldPreventUnmountOnClose
        };
    }

    private resolveOpenChangeTrigger(event: Event): HTMLElement | undefined {
        const target = event.target;

        if (target instanceof HTMLElement) {
            return target;
        }

        return this.engine.triggerElement ?? this.engine.inputElement() ?? undefined;
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
