import { computed, effect, Injector, Signal, signal, untracked } from '@angular/core';
import {
    AcceptableValue,
    createLabelRegistry,
    injectId,
    useElementRegistry,
    useFilter,
    useListHighlight,
    useRenderLifecycle
} from '@radix-ng/primitives/core';

/**
 * A combobox item, registered with the engine so it participates in filtering, navigation, and
 * selection. Implemented by `RdxComboboxItem` (and `RdxAutocompleteItem`); the engine depends only on
 * this structural shape to avoid a circular import.
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

/**
 * A custom filter predicate, matching Base UI's signature: the item's raw value (the object for object
 * items), the query, and an `itemToString` resolver that converts a value to its display/match text.
 * Value-first lets one filter match strings and objects alike (fuzzy / multi-key); the resolver gives
 * the text when needed. The shared engine contract; autocomplete's filter is the same shape.
 */
export type ComboboxFilter = (
    itemValue: AcceptableValue,
    query: string,
    itemToString?: (itemValue: AcceptableValue) => string
) => boolean;

/** Why the highlight moved: keyboard navigation, pointer hover, or a programmatic change. */
export type ComboboxHighlightReason = 'keyboard' | 'pointer' | 'none';

/**
 * Where the text input sits relative to the popup (Base UI's `inputInsidePopup`). `unknown` until an
 * input mounts — so a Trigger whose input lives in a not-yet-opened popup is still `Tab`-reachable.
 */
export type ComboboxInputLayout = 'unknown' | 'inside' | 'outside';

/** Payload of the highlight-changed emit. */
export interface ComboboxItemHighlightedDetails {
    /** The highlighted item's value, or `null` when the highlight is cleared. */
    value: AcceptableValue | null;
    /**
     * The highlighted item's index in the visible/filtered list (`-1` when cleared). In virtualized
     * mode this is the index into {@link ComboboxEngine.filteredItems}.
     */
    index: number;
    /** What caused the highlight to move. */
    reason: ComboboxHighlightReason;
}

/** The reactive inputs and callbacks a root hands the engine. */
export interface ComboboxEngineConfig {
    /** Injection context for the engine's effects/hooks. */
    injector: Injector;
    /** Prefix for the generated list id (e.g. `'rdx-combobox-list-'`). */
    listIdPrefix: string;
    /** CSS selector of the popup, used to decide focus restoration after a selection. */
    popupSelector: string;
    /** Whether the popup is open (the root owns the model; the engine only reads it). */
    open: Signal<boolean>;
    /** The active query string (the root derives it from its own typed/value semantics). */
    query: Signal<string>;
    /** Whether built-in filtering applies (always `true` for combobox; mode-gated for autocomplete). */
    filteringEnabled: Signal<boolean>;
    /** Whether keyboard navigation wraps at the list boundaries. */
    loopFocus: Signal<boolean>;
    /** Include the input-only position when looping. Defaults off. */
    allowEscape?: Signal<boolean>;
    /** Whether disabled items can receive a keyboard highlight. Defaults off. */
    disabledItemsFocusable?: boolean;
    /** Emit navigation attempts even when boundary clamping keeps the same item. */
    notifyOnUnchangedHighlight?: boolean;
    /** Text direction for horizontal grid navigation. Defaults to LTR. */
    dir?: Signal<'ltr' | 'rtl'>;
    /** Preserve a valid filtered-list cursor when an external query replaces its item. */
    preserveHighlightOnQuery?: boolean;
    /** Resolved auto-highlight mode. */
    autoHighlightMode: Signal<'off' | 'input-change' | 'always'>;
    /** Whether the list is externally virtualized (navigation runs over {@link items} by index). */
    virtualized: Signal<boolean>;
    /** Full set of item values for virtualized mode; `undefined` for DOM-driven lists. */
    items: Signal<readonly AcceptableValue[] | undefined>;
    /** Filter: `undefined` → default contains; a function → custom; `null` → built-in filtering off. */
    filter: Signal<ComboboxFilter | null | undefined>;
    /** Locale for the default `contains` collator; `undefined` → the runtime's default locale. */
    locale: Signal<Intl.LocalesArgument>;
    /** Maximum number of matching items to show (`-1` = no limit). */
    limit: Signal<number>;
    /** Whether the list is a 2D grid (row/column arrow navigation). Defaults off for plain lists. */
    grid: Signal<boolean>;
    /** Resolves an item element to its enclosing row element (e.g. the nearest `[rdxComboboxRow]`). */
    rowOf: (element: HTMLElement) => Element | null;
    /**
     * Resolves a raw item value to its display/match text — the `itemToString` Base UI passes to the
     * filter. DOM-aware (finds a mounted item by value and returns its text) so it works for both
     * DOM-driven and virtualized lists.
     */
    itemToString: (value: AcceptableValue) => string;
    /** Emits when the highlight moves (the root wires this to its `onItemHighlighted` output). */
    onItemHighlighted: (details: ComboboxItemHighlightedDetails, queryChanged: boolean) => void;
    /** Emits when open changes (skips the initial run); the root wires its `onOpenChange` output. */
    onOpenChange: (open: boolean) => void;
    /** Called after the open/close transition (including any exit animation) finishes. */
    onOpenChangeComplete: (open: boolean) => void;
}

/**
 * The shared Combobox engine (ADR 0014): item registry, filtering, highlight-model navigation,
 * open/close transition, and the reactive effects that tie them together — everything Combobox and
 * Autocomplete have in common. Value/selection semantics, open orchestration, and forms integration
 * stay in each root; the root configures the engine and reads its state for the DI context.
 *
 * Must be called in an injection context (it runs effects and `inject`-based hooks).
 *
 * @internal Not part of the public API — exported only for the autocomplete entry; may change without notice.
 */
export function useComboboxEngine(config: ComboboxEngineConfig) {
    const { injector } = config;
    // Locale-aware default filter. A `computed` so changing `locale` rebuilds the collator and
    // re-filters the list — mirrors Base UI, where `useFilter({ locale })` re-memoizes on change.
    const defaultFilter = computed(() => useFilter({ locale: config.locale() }));

    const listId = injectId(config.listIdPrefix);
    const labelRegistry = createLabelRegistry();
    let unregisterLegacyLabel: (() => void) | undefined;
    const inputElement = signal<HTMLInputElement | null>(null);
    // Where the text input lives relative to the popup (Base UI's `inputInsidePopup`), reported by the
    // input on mount from its positioner ancestor. Drives the Trigger's role:
    //   - `outside` → the input is the tab stop; the Trigger is a `tabindex="-1"` toggle.
    //   - `inside`  → the Trigger is the focusable `role="combobox"` control (`aria-haspopup="dialog"`).
    //   - `unknown` → no input has mounted yet (e.g. the input lives in a not-yet-opened popup); the
    //     Trigger stays a normal focusable button so it is reachable by `Tab` before the first open.
    const inputLayout = signal<ComboboxInputLayout>('unknown');
    // Whether the popup was opened by a touch interaction. When the input lives inside the popup, a
    // touch-open focuses the popup (not the input) so Android doesn't raise the virtual keyboard
    // (Base UI; iOS handles this itself). Reset to `false` on keyboard/mouse opens.
    const openedByTouch = signal(false);
    // Whether the popup directive is currently mounted (open through the close/exit animation, until the
    // render lifecycle unmounts it). Distinguishes "Escape closed the popup" (still mounted this tick)
    // from "Escape on an already-closed combobox" (unmounted) — Base UI's `mounted`, since `open()`
    // flips synchronously when the input's Escape handler (or the dismiss mechanism) closes the popup.
    const popupMounted = signal(false);
    let triggerElement: HTMLElement | null = null;
    // Tracks whether the last interaction was the keyboard, so the highlight doesn't jump to an item
    // the cursor happens to rest on when arrow-key navigation scrolls the list under a still pointer.
    let keyboardActive = false;

    const itemRegistry = useElementRegistry<ComboboxItemRef>({ injector });
    const orderedItems = itemRegistry.items;

    const visibleItems = computed<readonly ComboboxItemRef[]>(
        () => {
            const items = orderedItems();
            const limit = config.limit();
            if (limit === 0) {
                return [];
            }

            // Read root signals once per query, not once per item. The early paths also avoid
            // allocating/filtering when every registered item is known to be visible.
            if (!config.filteringEnabled()) {
                return limit >= 0 ? items.slice(0, limit) : items;
            }
            const filter = config.filter();
            if (filter === null) {
                return limit >= 0 ? items.slice(0, limit) : items;
            }
            const query = config.query();
            if (!filter && query.length === 0) {
                return limit >= 0 ? items.slice(0, limit) : items;
            }

            const matching: ComboboxItemRef[] = [];
            const contains = filter ? null : defaultFilter().contains;

            for (const item of items) {
                // Custom filter: Base UI shape `(value, query, itemToString)`. Default: locale-aware
                // contains on the item's own text (the element content), no value→text round-trip.
                const matches = filter
                    ? filter(item.value(), query, config.itemToString)
                    : contains!(item.textValue(), query);
                if (!matches) {
                    continue;
                }
                matching.push(item);
                if (limit >= 0 && matching.length >= limit) {
                    break;
                }
            }

            return matching;
        },
        // Queries such as R → Ro → Row → "Row " can produce the exact same visible item
        // sequence. Preserve the previous collection in that case so 500 item-level `isVisible`
        // computeds and their host bindings stay cached while the input itself still updates.
        { equal: sameItemOrder }
    );

    const visibleSet = computed(() => new Set(visibleItems()));
    const isVisible = (item: ComboboxItemRef): boolean => visibleSet().has(item);

    const filteredItems = computed<readonly AcceptableValue[]>(() => {
        const data = config.items();
        if (data === undefined) {
            return visibleItems().map((item) => item.value());
        }
        const limit = config.limit();
        const cap = (arr: readonly AcceptableValue[]) => (limit >= 0 ? arr.slice(0, limit) : arr);

        if (!config.filteringEnabled()) {
            return cap(data);
        }
        const filter = config.filter();
        if (filter === null) {
            return cap(data);
        }
        const query = config.query();
        if (!query) {
            return cap(data);
        }
        // Virtualized: no DOM to read text from, so resolve each value through `itemToString`.
        return cap(
            data.filter((value) =>
                filter
                    ? filter(value, query, config.itemToString)
                    : defaultFilter().contains(config.itemToString(value), query)
            )
        );
    });

    const visibleCount = computed(() => (config.virtualized() ? filteredItems().length : visibleItems().length));

    const isNavigable = (item: ComboboxItemRef): boolean =>
        isVisible(item) && (config.disabledItemsFocusable === true || !item.disabled());

    const highlight = useListHighlight<ComboboxItemRef>({
        items: orderedItems,
        isNavigable,
        getId: (item) => item.id,
        loop: config.loopFocus,
        allowEscape: config.allowEscape,
        injector
    });

    const highlightedItem = highlight.highlightedItem;
    const highlightedIndex = signal(-1);
    const highlightAction = signal({ reason: 'none' as ComboboxHighlightReason, force: false });
    const recordHighlight = (reason: ComboboxHighlightReason, force = false): void => {
        highlightAction.set({ reason, force });
    };

    const itemId = (index: number): string => `${listId}-item-${index}`;

    const activeId = computed(() => {
        if (config.virtualized()) {
            const index = highlightedIndex();
            return index >= 0 ? itemId(index) : undefined;
        }
        return highlight.activeId();
    });

    const pendingHighlightEdge = signal<'first' | 'last' | number | null>(null);

    const transition = useRenderLifecycle(config.onOpenChangeComplete, { open: config.open });

    // --- effects ---

    // Emit open changes and drive the open/close transition (skip the initial run).
    let previousOpen = untracked(config.open);
    effect(
        () => {
            const open = config.open();
            if (open === previousOpen) {
                return;
            }
            previousOpen = open;
            untracked(() => {
                // Drop a deferred open-edge highlight when the popup closes — otherwise a pending
                // 'first' (e.g. ArrowDown opened an empty list, then it closed) would unexpectedly
                // highlight on the next plain open, even without autoHighlight.
                if (!open) {
                    pendingHighlightEdge.set(null);
                }
                config.onOpenChange(open);
                transition.start(open);
            });
        },
        { injector }
    );

    // Publish actual transitions and explicit navigation attempts. Collection updates carry no stale
    // interaction reason. Query metadata keeps a controlled value authoritative over its auto-highlight.
    let previous: { item: ComboboxItemRef | null; index: number; value: AcceptableValue | null } | undefined;
    let previousAction = untracked(highlightAction);
    let previousQuery = untracked(config.query);
    effect(
        () => {
            const action = highlightAction();
            const virtualized = config.virtualized();
            const item = virtualized ? null : highlightedItem();
            const index = virtualized ? highlightedIndex() : item ? visibleItems().indexOf(item) : -1;
            const data = virtualized ? filteredItems() : visibleItems();
            const value = virtualized ? (index >= 0 ? filteredItems()[index] : null) : (item?.value() ?? null);
            const query = config.query();
            const pending = pendingHighlightEdge();
            if (typeof pending === 'number') return;
            if ((index >= 0 && value === undefined) || (item && index < 0)) return;
            const current = { item, index, value: value ?? null };
            if (previous === undefined) {
                previous = current;
                previousAction = action;
                previousQuery = query;
                return;
            }
            const attempted = action !== previousAction;
            const changed = previous.item !== item || previous.index !== index || previous.value !== current.value;
            previousAction = action;
            if (!changed && !(attempted && action.force)) {
                // Later arriving data is a new collection update after the value update has settled.
                if (pending === null || (config.items() !== undefined ? filteredItems().length : data.length) === 0)
                    previousQuery = query;
                return;
            }
            if (
                config.preserveHighlightOnQuery &&
                config.items() !== undefined &&
                !virtualized &&
                !attempted &&
                query !== previousQuery &&
                item === null &&
                previous.index >= 0 &&
                pending === null &&
                previous.index < filteredItems().length
            ) {
                pendingHighlightEdge.set(previous.index);
                return;
            }
            const queryChanged = previousQuery !== query;
            previous = current;
            previousQuery = query;
            const reason = attempted ? action.reason : 'none';
            untracked(() => config.onItemHighlighted({ value: current.value, index, reason }, queryChanged));
        },
        { injector }
    );

    // Apply a deferred open-edge highlight once items (DOM refs) or filtered data have registered.
    effect(
        () => {
            const edge = pendingHighlightEdge();
            const count = config.virtualized() ? filteredItems().length : visibleItems().length;
            if (!config.open() || edge === null || count === 0) {
                return;
            }
            untracked(() => {
                // Programmatic move — reset the reason so the emit reports 'none', not a stale interaction.
                recordHighlight('none');
                if (config.virtualized()) {
                    highlightedIndex.set(typeof edge === 'number' ? edge : edge === 'last' ? count - 1 : 0);
                } else if (typeof edge === 'number') {
                    highlight.set(visibleItems()[edge] ?? null);
                } else if (edge === 'last') {
                    highlight.last();
                } else {
                    highlight.first();
                }
                pendingHighlightEdge.set(null);
            });
        },
        { injector }
    );

    // autoHighlight 'always': keep the first navigable item highlighted whenever the popup is open.
    effect(
        () => {
            orderedItems();
            visibleCount();
            if (config.autoHighlightMode() === 'always' && config.open()) {
                untracked(() => {
                    if (config.virtualized()) {
                        const length = filteredItems().length;
                        const index = highlightedIndex();
                        if ((index < 0 || index >= length) && length > 0) {
                            recordHighlight('none');
                            highlightedIndex.set(0);
                        }
                    } else if (highlightedItem() === null) {
                        recordHighlight('none');
                        highlight.first();
                    }
                });
            }
        },
        { injector }
    );

    // Virtualized self-heal: clear a highlight that filtering has pushed out of range.
    effect(
        () => {
            if (!config.virtualized()) {
                return;
            }
            const length = filteredItems().length;
            untracked(() => {
                const index = highlightedIndex();
                if (index >= length && index !== -1) {
                    recordHighlight('none');
                    highlightedIndex.set(-1);
                }
            });
        },
        { injector }
    );

    // --- navigation facade (mode-aware: index-based when virtualized, else DOM-ref) ---

    const stepIndex = (direction: 1 | -1): void => {
        const length = filteredItems().length;
        if (length === 0) {
            highlightedIndex.set(-1);
            return;
        }
        const current = highlightedIndex();
        if (current < 0) {
            highlightedIndex.set(direction === 1 ? 0 : length - 1);
            return;
        }
        let next = current + direction;
        const loop = config.loopFocus();
        if (loop && config.allowEscape?.() && (next < 0 || next >= length)) {
            highlightedIndex.set(-1);
            return;
        }
        if (next < 0) {
            next = loop ? length - 1 : 0;
        } else if (next >= length) {
            next = loop ? 0 : length - 1;
        }
        highlightedIndex.set(next);
    };

    // --- grid navigation (DOM-ref mode only) ---

    /** Visible items grouped into rows by their enclosing row element (DOM order). */
    const gridRows = (): ComboboxItemRef[][] => {
        const rows = new Map<Element | null, ComboboxItemRef[]>();
        for (const item of visibleItems()) {
            const key = config.rowOf(item.element);
            const bucket = rows.get(key);
            if (bucket) {
                bucket.push(item);
            } else {
                rows.set(key, [item]);
            }
        }
        return [...rows.values()];
    };

    /** Grid vertical move: keep the column index, jump to the adjacent row (wraps when looping). */
    const gridVertical = (direction: 1 | -1): void => {
        const rows = gridRows();
        if (rows.length === 0) {
            return;
        }
        const current = highlightedItem();
        if (!current) {
            const row = direction === 1 ? rows[0] : rows[rows.length - 1];
            highlight.set((direction === 1 ? row[0] : row[row.length - 1]) ?? null);
            return;
        }
        let rowIndex = rows.findIndex((row) => row.includes(current));
        const col = rowIndex >= 0 ? rows[rowIndex].indexOf(current) : 0;
        const loop = config.loopFocus();
        rowIndex += direction;
        if (rowIndex < 0) {
            rowIndex = loop ? rows.length - 1 : 0;
        } else if (rowIndex >= rows.length) {
            rowIndex = loop ? 0 : rows.length - 1;
        }
        const targetRow = rows[rowIndex];
        highlight.set(targetRow[Math.min(col, targetRow.length - 1)] ?? null);
    };

    return {
        listId,
        ...labelRegistry,
        setLabelId(id: string | undefined): void {
            unregisterLegacyLabel?.();
            unregisterLegacyLabel = id === undefined ? undefined : labelRegistry.registerLabel(id);
        },
        labelControlElement: () => (inputLayout() === 'outside' ? inputElement() : (triggerElement ?? inputElement())),
        inputElement: inputElement.asReadonly(),
        setInputElement(el: HTMLInputElement | null): void {
            inputElement.set(el);
        },
        inputLayout: inputLayout.asReadonly(),
        setInputLayout(layout: ComboboxInputLayout): void {
            inputLayout.set(layout);
        },
        openedByTouch: openedByTouch.asReadonly(),
        setOpenedByTouch(value: boolean): void {
            openedByTouch.set(value);
        },
        popupMounted: popupMounted.asReadonly(),
        setPopupMounted(value: boolean): void {
            popupMounted.set(value);
        },
        get triggerElement() {
            return triggerElement;
        },
        setTrigger(el: HTMLElement | null) {
            triggerElement = el;
        },

        orderedItems,
        visibleItems,
        visibleCount,
        filteredItems,
        isVisible,
        registerItem(item: ComboboxItemRef): void {
            itemRegistry.register(item);
        },
        unregisterItem(item: ComboboxItemRef): void {
            itemRegistry.unregister(item);
        },

        highlight,
        highlightedItem,
        highlightedIndex: highlightedIndex.asReadonly(),
        activeId,
        itemId,
        setHighlightReason: recordHighlight,
        setPendingHighlightEdge(edge: 'first' | 'last' | number | null): void {
            pendingHighlightEdge.set(edge);
        },

        highlightNext(reason: ComboboxHighlightReason = 'keyboard'): void {
            recordHighlight(reason, !!config.notifyOnUnchangedHighlight && !config.grid());
            if (config.virtualized()) {
                stepIndex(1);
            } else if (config.grid()) {
                gridVertical(1);
            } else {
                highlight.next();
            }
        },
        highlightPrevious(reason: ComboboxHighlightReason = 'keyboard'): void {
            recordHighlight(reason, !!config.notifyOnUnchangedHighlight && !config.grid());
            if (config.virtualized()) {
                stepIndex(-1);
            } else if (config.grid()) {
                gridVertical(-1);
            } else {
                highlight.previous();
            }
        },
        // Grid horizontal moves (next/previous cell in DOM order). No-op outside grid mode.
        highlightNextColumn(reason: ComboboxHighlightReason = 'keyboard'): void {
            if (!config.grid() || config.virtualized()) {
                return;
            }
            recordHighlight(reason, !!config.notifyOnUnchangedHighlight);
            if (config.dir?.() === 'rtl') {
                highlight.previous();
            } else {
                highlight.next();
            }
        },
        highlightPreviousColumn(reason: ComboboxHighlightReason = 'keyboard'): void {
            if (!config.grid() || config.virtualized()) {
                return;
            }
            recordHighlight(reason, !!config.notifyOnUnchangedHighlight);
            if (config.dir?.() === 'rtl') {
                highlight.next();
            } else {
                highlight.previous();
            }
        },
        highlightFirst(reason: ComboboxHighlightReason = 'keyboard'): void {
            recordHighlight(reason);
            if (config.virtualized()) {
                highlightedIndex.set(filteredItems().length > 0 ? 0 : -1);
            } else {
                highlight.first();
            }
        },
        highlightLast(reason: ComboboxHighlightReason = 'keyboard'): void {
            recordHighlight(reason);
            if (config.virtualized()) {
                const length = filteredItems().length;
                highlightedIndex.set(length > 0 ? length - 1 : -1);
            } else {
                highlight.last();
            }
        },
        highlightIndex(index: number, reason: ComboboxHighlightReason): void {
            if (index < 0 || index >= filteredItems().length) {
                return;
            }
            recordHighlight(reason);
            highlightedIndex.set(index);
        },
        setHighlight(item: ComboboxItemRef, reason: ComboboxHighlightReason): void {
            recordHighlight(reason);
            highlight.set(item);
        },
        clearHighlightState(reason: ComboboxHighlightReason = 'none'): void {
            recordHighlight(reason);
            highlight.clear();
            highlightedIndex.set(-1);
        },

        isKeyboardActive(): boolean {
            return keyboardActive;
        },
        setKeyboardActive(value: boolean): void {
            keyboardActive = value;
        },

        renderLifecycle: transition,
        transitionStatus: transition.status,
        registerTransitionElement: transition.registerElement,

        focusInput(): void {
            inputElement()?.focus();
        },
        selectInputText(): void {
            inputElement()?.select();
        },
        /**
         * Restore focus after a selection: the input when it sits outside the popup, otherwise the
         * trigger. Skipped when the consumer moved focus during the `onValueChange` callback — pass the
         * `document.activeElement` captured *before* the emit so we don't clobber a consumer's choice
         * (e.g. focusing an external message field after inserting an emoji).
         */
        restoreFocusAfterSelect(previousActiveElement: Element | null): void {
            if (typeof document !== 'undefined' && document.activeElement !== previousActiveElement) {
                return;
            }
            const input = inputElement();
            if (input && !input.closest(config.popupSelector)) {
                input.focus();
            } else {
                triggerElement?.focus();
            }
        }
    };
}

/** The shape returned by {@link useComboboxEngine}. */
export type ComboboxEngine = ReturnType<typeof useComboboxEngine>;

/** Referential item-sequence equality used to keep unchanged filtering results stable across queries. */
function sameItemOrder(previous: readonly ComboboxItemRef[], next: readonly ComboboxItemRef[]): boolean {
    if (previous === next) {
        return true;
    }
    if (previous.length !== next.length) {
        return false;
    }
    for (let index = 0; index < previous.length; index++) {
        if (previous[index] !== next[index]) {
            return false;
        }
    }
    return true;
}
