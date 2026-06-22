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
    ComboboxHighlightReason,
    ComboboxInputLayout,
    ComboboxItemHighlightedDetails,
    ComboboxItemRef,
    provideComboboxRootContext,
    RdxComboboxOpenChange,
    RdxComboboxOpenChangeReason,
    RdxComboboxRootContext,
    useComboboxEngine
} from '@radix-ng/primitives/combobox';
import {
    AcceptableValue,
    BooleanInput,
    createCancelableChangeEventDetails,
    createFloatingRootContext,
    itemToStringLabel as defaultItemToStringLabel,
    Direction,
    isItemEqualToValue as itemsEqual,
    ItemValueComparator,
    provideFloatingRootContext,
    provideFloatingTree,
    RdxCancelableChangeEventDetails,
    rdxDevWarning,
    RdxFloatingRootContext,
    RdxFormUiControlBase,
    RdxFormUiTouchTarget,
    RdxFormValueControl
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { RdxPopper } from '@radix-ng/primitives/popper';

/** The shared engine instance shape (the `ComboboxEngine` type is not part of combobox's public API). */
type ComboboxEngine = ReturnType<typeof useComboboxEngine>;

/**
 * Autocomplete filtering / inline-completion behavior, mirroring Base UI's `mode`:
 * - `'list'` (default): items are filtered by the query; the input text never changes from the active item.
 * - `'both'`: items are filtered **and** the input is inline-completed from the active item.
 * - `'inline'`: items are static (not filtered) but the input is inline-completed from the active item.
 * - `'none'`: items are static and the input is never changed from the active item.
 */
export type AutocompleteMode = 'list' | 'both' | 'inline' | 'none';

/**
 * A custom filter predicate, matching Base UI's signature: the item's raw value (the object for object
 * items), the query, and an `itemToString` resolver. Value-first lets one filter match strings and
 * objects alike (fuzzy / multi-key). The same shape as the shared combobox engine's `ComboboxFilter`.
 */
export type AutocompleteFilter = (
    itemValue: AcceptableValue,
    query: string,
    itemToString?: (itemValue: AcceptableValue) => string
) => boolean;

/** Why the input value changed, mirroring Base UI's `onValueChange` details. */
export type AutocompleteChangeReason = 'input-change' | 'item-press' | 'input-clear' | 'none';

/** Payload of {@link RdxAutocompleteRoot.onValueChange}: the new value and why it changed. */
export interface AutocompleteValueChangeDetails {
    /** The new input value. */
    value: string;
    /** What caused the change (e.g. skip `'item-press'` to avoid overwriting an external value). */
    reason: AutocompleteChangeReason;
    /** Cancelable details — call `eventDetails.cancel()` to veto the change. */
    eventDetails: RdxCancelableChangeEventDetails<AutocompleteChangeReason>;
}

/** Re-exported for consumers: the highlight reason and payload shape are shared with the combobox engine. */
export type {
    ComboboxHighlightReason as AutocompleteHighlightReason,
    ComboboxItemHighlightedDetails as AutocompleteItemHighlightedDetails
} from '@radix-ng/primitives/combobox';

// The engine stays private to the root; the context factory (a free function) reads it through this registry.
const engineRegistry = new WeakMap<RdxAutocompleteRoot, ComboboxEngine>();

/**
 * Builds the {@link RdxComboboxRootContext} the autocomplete parts consume. Autocomplete reuses the
 * combobox parts (List, Popup, Positioner, Item, …) verbatim, so it provides the exact combobox context
 * shape — configured for a single-value, `selectionMode: 'none'` control whose value **is** the input
 * string. The shared engine supplies registry / filtering / highlight / inline; the root supplies the
 * string-value semantics. Autocomplete-specific parts (mode, inline, grid) inject {@link RdxAutocompleteRoot}.
 */
const context = (): RdxComboboxRootContext => {
    const root = inject(RdxAutocompleteRoot);
    const engine = engineRegistry.get(root)!;
    return {
        listId: engine.listId,
        labelId: engine.labelId,
        setLabelId: (id: string | undefined) => engine.setLabelId(id),
        dir: root.dir,
        value: root.value,
        inputValue: root.value,
        open: root.open,
        present: root.present,
        multiple: root.alwaysFalse,
        selectionMode: root.noneMode,
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
        isSelected: (value: AcceptableValue) => root.isSelectedValue(value),
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
        setInputValue: (value: string) => root.setQuery(value),
        openAndHighlight: (edge: 'first' | 'last', reason?: RdxComboboxOpenChangeReason, event?: Event) =>
            root.openAndHighlight(edge, reason, event),
        navigateByKeyboard: (direction: 1 | -1, event?: Event) => root.navigateByKeyboard(direction, event),
        invalidState: root.invalidState,
        touchedState: root.touchedState,
        dirtyState: root.dirtyState,
        select: (item: ComboboxItemRef, event?: Event) => root.handleSelect(item, event),
        selectIndex: (index: number, event?: Event) => root.selectIndex(index, event),
        selectHighlighted: (event?: Event) => root.selectHighlighted(event),
        clearSelection: () => root.clearValue(),
        removeValue: () => undefined,
        removeLastValue: () => undefined,
        registerChipsNav: () => undefined,
        focusLastChip: () => false,
        labelFor: (value: AcceptableValue) => root.labelFor(value),
        markAsTouched: () => root.markAsTouched()
        // `value`/`inputValue` are the input string here, not `ComboboxValue`.
    } as RdxComboboxRootContext;
};

type RdxAutocompleteOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxComboboxOpenChangeReason>;

interface RdxAutocompleteOpenChangeTransaction {
    payload: RdxComboboxOpenChange;
    eventDetails: RdxAutocompleteOpenChangeEventDetails;
    shouldPreventUnmountOnClose: () => boolean;
}

/**
 * `autoHighlight` transform: pass `'always'` through verbatim, coerce everything else as a boolean
 * attribute (so the bare `autoHighlight` attribute reads `true`). Kept as a named function (compodoc
 * hangs on an inline arrow combined with union-generic `input()`).
 */
function coerceAutoHighlight(value: BooleanInput | 'always'): boolean | 'always' {
    return value === 'always' ? 'always' : booleanAttribute(value);
}

/**
 * Root of an Autocomplete — a text input with a filtered list of suggestions. A thin configuration over
 * the shared combobox engine (ADR 0014) with `selectionMode: 'none'`, so its value **is** the input
 * string: typing, selecting an item, or clearing all change a single string value. Implements
 * `ControlValueAccessor` (the form value is the input string).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteRoot]',
    exportAs: 'rdxAutocompleteRoot',
    providers: [
        provideComboboxRootContext(context),
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxAutocompleteRoot, multi: true },
        // New floating foundation (ADR 0015/0017) — the dismissal capability reads this shared context.
        provideFloatingTree(),
        provideFloatingRootContext(() => inject(RdxAutocompleteRoot).floatingContext)
    ],
    hostDirectives: [RdxPopper],
    host: {
        '[attr.data-disabled]': 'disabledState() ? "" : undefined'
    }
})
export class RdxAutocompleteRoot
    extends RdxFormUiControlBase
    implements ControlValueAccessor, RdxFormValueControl<string>
{
    private readonly injector = inject(Injector);

    /** Per-popup floating root context (ADR 0015) — `open` / `triggers` / reference for the dismissal engine. */
    readonly floatingContext: RdxFloatingRootContext = createFloatingRootContext({
        ownerDocument: inject(ElementRef).nativeElement.ownerDocument,
        open: () => this.open()
    });

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
    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly dir = injectDirection(this.dirInput);

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

    /** Whether moving the pointer over an item highlights it. */
    readonly highlightItemOnHover = input(true, { transform: booleanAttribute });

    /** Whether a pointer-driven highlight is kept when the cursor leaves the list. */
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
     * `undefined` → locale-aware contains; a function → custom `(value, query, itemToString)`; `null` →
     * built-in filtering disabled.
     */
    readonly filter = input<AutocompleteFilter | null | undefined>(undefined);

    /** Maximum number of matching items to show. `-1` (default) means no limit. */
    readonly limit = input(-1, { transform: numberAttribute });

    /** The full set of item values for {@link virtualized} mode. */
    readonly items = input<readonly AcceptableValue[]>();

    /** Whether the list is externally virtualized (navigation runs over {@link items} by index). */
    readonly virtualized = input(false, { transform: booleanAttribute });

    /** How item values are compared for equality (a comparator function or an object key). Base UI prop name. */
    readonly isItemEqualToValue = input<ItemValueComparator<AcceptableValue>>();

    /** Converts an item value to its string label (filter text + input text on selection). */
    readonly itemToStringValue = input<(value: AcceptableValue) => string>();

    /** Emits when the input value changes (typing, selection, or clear), with the reason. */
    readonly onValueChange = output<AutocompleteValueChangeDetails>();

    /** Emits when the popup opens or closes. */
    readonly onOpenChange = output<RdxComboboxOpenChange>();

    /** Emits as the highlight moves, with the item's value, its index in {@link filteredItems}, and the reason. */
    readonly onItemHighlighted = output<ComboboxItemHighlightedDetails>();

    /** Emits after the open/close transition (including any exit animation) finishes. */
    readonly onOpenChangeComplete = output<boolean>();

    /** Constant signals exposed to the combobox context (autocomplete is always single-value). */
    readonly alwaysFalse = signal(false);
    readonly noneMode = signal<'none'>('none');

    private readonly cvaDisabled = signal(false);
    readonly disabledState = computed(() => this.disabled() || this.cvaDisabled());
    readonly requiredState = computed(() => this.required());
    /** @ignore */
    readonly invalidState = this.formUi.invalidState;
    /** @ignore */
    readonly touchedState = this.formUi.touchedState;
    /** @ignore */
    readonly dirtyState = this.formUi.dirtyState;
    private readonly preventUnmountOnClose = signal(false);
    readonly present = computed(() => this.open() || this.preventUnmountOnClose());

    /** Whether built-in filtering applies in the current mode (`list` / `both`). */
    private readonly filteringMode = computed(() => this.mode() === 'list' || this.mode() === 'both');

    /** Whether inline completion applies in the current mode (`both` / `inline`). */
    readonly inlineMode = computed(() => this.mode() === 'both' || this.mode() === 'inline');

    /**
     * Whether the input text is a fresh user query rather than a committed selection's label. While
     * `false` (just opened, or showing a committed selection), the list is unfiltered; it flips `true`
     * on the first keystroke.
     */
    private readonly typed = signal(false);

    /** The text the user actually typed, used as the filter query. */
    readonly query = computed(() => (this.typed() ? (this.value() ?? '') : ''));

    /** The shared engine: item registry, filtering, highlight navigation (grid), inline, transition. */
    private readonly engine: ComboboxEngine = useComboboxEngine({
        injector: this.injector,
        listIdPrefix: 'rdx-autocomplete-list-',
        popupSelector: '[rdxAutocompletePopup]',
        open: this.open,
        query: this.query,
        filteringEnabled: this.filteringMode,
        loopFocus: this.loopFocus,
        autoHighlightMode: this.autoHighlightMode,
        virtualized: this.virtualized,
        items: this.items,
        filter: this.filter,
        limit: this.limit,
        grid: this.grid,
        rowOf: (element) => element.closest('[rdxAutocompleteRow]'),
        inlineMode: this.inlineMode,
        itemToString: (value) => this.labelFor(value),
        onItemHighlighted: (details) => this.onItemHighlighted.emit(details),
        onOpenChange: () => {},
        onOpenChangeComplete: (open) => this.onOpenChangeComplete.emit(open)
    });

    /** What the input element displays: the inline preview if any, else the committed value. */
    readonly displayValue = computed(() => this.engine.inlinePreview() ?? this.value() ?? '');

    // --- engine-backed surface read by the parts / tests ---
    get listId() {
        return this.engine.listId;
    }
    get labelId() {
        return this.engine.labelId;
    }
    get inputElement() {
        return this.engine.inputElement;
    }
    setInputElement(el: HTMLInputElement | null): void {
        this.engine.setInputElement(el);
    }
    setInputLayout(layout: ComboboxInputLayout): void {
        this.engine.setInputLayout(layout);
    }
    setPopupMounted(value: boolean): void {
        this.engine.setPopupMounted(value);
    }
    get inputLayout() {
        return this.engine.inputLayout;
    }
    get openedByTouch() {
        return this.engine.openedByTouch;
    }
    get popupMounted() {
        return this.engine.popupMounted;
    }
    get highlight() {
        return this.engine.highlight;
    }
    get highlightedItem() {
        return this.engine.highlightedItem;
    }
    get highlightedIndex() {
        return this.engine.highlightedIndex;
    }
    get activeId() {
        return this.engine.activeId;
    }
    get filteredItems() {
        return this.engine.filteredItems;
    }
    get visibleCount() {
        return this.engine.visibleCount;
    }
    get inlinePreview() {
        return this.engine.inlinePreview;
    }
    get transitionStatus() {
        return this.engine.transitionStatus;
    }
    get registerTransitionElement() {
        return this.engine.registerTransitionElement;
    }
    get triggerElement() {
        return this.engine.triggerElement;
    }

    private onChange?: (value: string) => void;
    private onTouched?: () => void;

    constructor() {
        super();

        engineRegistry.set(this, this.engine);

        // Keep the dismissal reference in sync with the input (the anchor) so a press / focus on it counts
        // as "inside" and never dismisses (ADR 0015).
        effect(() => this.floatingContext.setReferenceElement(this.engine.inputElement() ?? null));

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

    setSuppressInline(value: boolean): void {
        this.engine.setSuppressInline(value);
    }

    /** Opens the popup for browsing (resets the query to "pristine" and selects the input text). */
    openForBrowse(
        reason: RdxComboboxOpenChangeReason = 'none',
        event: Event = new Event('autocomplete.open-change')
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
        event: Event = new Event('autocomplete.open-change')
    ): void {
        if (!this.open()) {
            this.typed.set(false);
        }
        this.setOpen(true, reason, event);
        this.engine.selectInputText();
        this.engine.setPendingHighlightEdge(edge);
    }

    /** Whether the item's value/label matches the current input value (combobox context contract). */
    isSelectedValue(value: AcceptableValue): boolean {
        const current = this.value();
        if (!current) {
            return false;
        }
        return value === current || itemsEqual(value, current, this.isItemEqualToValue());
    }

    setOpen(
        open: boolean,
        reason: RdxComboboxOpenChangeReason = 'none',
        event: Event = new Event('autocomplete.open-change')
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
        event: Event = new Event('autocomplete.open-change')
    ): void {
        if (!this.open()) {
            return;
        }

        if (!this.setOpen(false, reason, event)) {
            return;
        }

        this.engine.clearHighlightState();
        this.engine.clearInlinePreview();
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
            this.engine.setPendingHighlightEdge('first-match');
        }
    }

    labelFor(value: AcceptableValue): string {
        const custom = this.itemToStringValue();
        if (custom) {
            return custom(value);
        }
        const item = this.engine.orderedItems().find((i) => itemsEqual(i.value(), value, this.isItemEqualToValue()));
        return item ? item.textValue() : defaultItemToStringLabel(value);
    }

    itemId(index: number): string {
        return this.engine.itemId(index);
    }

    isVisible(item: ComboboxItemRef): boolean {
        return this.engine.isVisible(item);
    }

    registerItem(item: ComboboxItemRef): void {
        this.engine.registerItem(item);
    }

    unregisterItem(item: ComboboxItemRef): void {
        this.engine.unregisterItem(item);
    }

    handleSelect(item: ComboboxItemRef, event: Event = new Event('autocomplete.item-press')): void {
        if (this.disabledState() || this.readOnly() || item.disabled()) {
            return;
        }
        this.commitSelection(item.textValue() || this.labelFor(item.value()), event);
    }

    /** Selects the filtered item at `index` (virtualized mode). */
    selectIndex(index: number, event: Event = new Event('autocomplete.item-press')): void {
        if (this.disabledState() || this.readOnly()) {
            return;
        }
        const value = this.engine.filteredItems()[index];
        if (value === undefined) {
            return;
        }
        this.commitSelection(this.labelFor(value), event);
    }

    /** Commits a selection: the input value becomes the item's label, the popup closes. */
    private commitSelection(label: string, event: Event = new Event('autocomplete.item-press')): void {
        // Capture focus before `commitValue` emits `onValueChange`, so restoration is skipped when the
        // consumer moves focus in that callback (e.g. focusing a message field after an emoji press).
        const activeBefore = typeof document !== 'undefined' ? document.activeElement : null;
        this.engine.clearInlinePreview();
        this.commitValue(label, 'item-press');
        this.typed.set(false);
        this.closePopup(false, 'item-press', event);
        this.engine.restoreFocusAfterSelect(activeBefore);
        this.maybeSubmit();
    }

    private maybeSubmit(): void {
        if (this.submitOnItemClick()) {
            this.engine.inputElement()?.form?.requestSubmit?.();
        }
    }

    selectHighlighted(event: Event = new Event('autocomplete.item-press')): void {
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

    // --- highlight navigation facade (delegates to the engine; grid-aware) ---

    navigateByKeyboard(direction: 1 | -1, event: Event = new Event('autocomplete.open-change')): void {
        this.engine.setKeyboardActive(true);
        if (!this.open()) {
            this.openAndHighlight(direction === 1 ? 'first' : 'last', 'list-navigation', event);
        } else if (direction === 1) {
            this.engine.highlightNext();
        } else {
            this.engine.highlightPrevious();
        }
    }

    moveDown(): void {
        this.engine.highlightNext();
    }
    moveUp(): void {
        this.engine.highlightPrevious();
    }
    moveRight(): void {
        this.engine.highlightNextColumn();
    }
    moveLeft(): void {
        this.engine.highlightPreviousColumn();
    }
    highlightFirst(reason: ComboboxHighlightReason = 'keyboard'): void {
        this.engine.highlightFirst(reason);
    }
    highlightLast(reason: ComboboxHighlightReason = 'keyboard'): void {
        this.engine.highlightLast(reason);
    }
    highlightIndex(index: number, reason: ComboboxHighlightReason): void {
        this.engine.highlightIndex(index, reason);
    }
    setHighlight(item: ComboboxItemRef, reason: ComboboxHighlightReason): void {
        this.engine.setHighlight(item, reason);
    }
    clearHighlightState(): void {
        this.engine.clearHighlightState();
    }

    isKeyboardActive(): boolean {
        return this.engine.isKeyboardActive();
    }
    setKeyboardActive(value: boolean): void {
        this.engine.setKeyboardActive(value);
    }

    clearValue(): void {
        if (this.disabledState() || this.readOnly()) {
            return;
        }
        this.commitValue('', 'input-clear');
        this.typed.set(true);
        this.engine.clearInlinePreview();
        this.engine.clearHighlightState();
        this.engine.focusInput();
    }

    focusInput(): void {
        this.engine.focusInput();
    }

    /** @ignore Bridge the CVA `onTouched` so `markAsTouched()` also notifies Reactive/template forms. */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return { markAsTouched: () => this.onTouched?.() };
    }

    markAsTouched(): void {
        this.formUi.markAsTouched();
    }

    private commitValue(
        value: string,
        reason: AutocompleteChangeReason,
        event: Event = new Event('autocomplete.value-change')
    ): void {
        // Mirror combobox's guarded commit: never mutate the value while disabled or read-only
        // (the input is the form value here, so Clear / item-press / typing must all be inert).
        if (this.disabledState() || this.readOnly()) {
            return;
        }
        const { eventDetails } = createCancelableChangeEventDetails(
            reason,
            event,
            this.resolveOpenChangeTrigger(event)
        );
        this.onValueChange.emit({ value, reason, eventDetails });
        if (eventDetails.isCanceled()) {
            return;
        }
        this.value.set(value);
        this.formUi.markDirty();
        this.onChange?.(value);
    }

    private createOpenChangeEvent(
        open: boolean,
        reason: RdxComboboxOpenChangeReason,
        event: Event
    ): RdxAutocompleteOpenChangeTransaction {
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
