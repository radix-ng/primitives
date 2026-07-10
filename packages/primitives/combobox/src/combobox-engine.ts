import { computed, effect, Injector, Signal, signal, untracked } from '@angular/core';
import { AcceptableValue, injectId, useFilter, useListHighlight, useTransitionStatus } from '@radix-ng/primitives/core';

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
     * Whether inline completion is active (autocomplete `both` / `inline` modes). When on, the engine
     * maintains an {@link ComboboxEngine.inlinePreview} that mirrors the highlighted item's label into
     * the input. Always `false` for combobox (it never inline-completes).
     */
    inlineMode: Signal<boolean>;
    /**
     * Resolves a raw item value to its display/match text — the `itemToString` Base UI passes to the
     * filter. DOM-aware (finds a mounted item by value and returns its text) so it works for both
     * DOM-driven and virtualized lists.
     */
    itemToString: (value: AcceptableValue) => string;
    /** Emits when the highlight moves (the root wires this to its `onItemHighlighted` output). */
    onItemHighlighted: (details: ComboboxItemHighlightedDetails) => void;
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
    const labelId = signal<string | undefined>(undefined);
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
    // presence machine unmounts it). Distinguishes "Escape closed the popup" (still mounted this tick)
    // from "Escape on an already-closed combobox" (unmounted) — Base UI's `mounted`, since `open()`
    // flips synchronously when the input's Escape handler (or the dismiss mechanism) closes the popup.
    const popupMounted = signal(false);
    let triggerElement: HTMLElement | null = null;
    // Tracks whether the last interaction was the keyboard, so the highlight doesn't jump to an item
    // the cursor happens to rest on when arrow-key navigation scrolls the list under a still pointer.
    let keyboardActive = false;

    const _items = signal<readonly ComboboxItemRef[]>([]);

    const orderedItems = computed(() => {
        const items = [..._items()];
        return items.sort((a, b) => domOrder(a.element, b.element));
    });

    const matchesFilter = (item: ComboboxItemRef): boolean => {
        if (!config.filteringEnabled()) {
            return true;
        }
        const filter = config.filter();
        if (filter === null) {
            return true;
        }
        const query = config.query();
        // Custom filter: Base UI shape `(value, query, itemToString)`. Default: locale-aware contains
        // on the item's own text (the element content), no value→text round-trip.
        return filter
            ? filter(item.value(), query, config.itemToString)
            : defaultFilter().contains(item.textValue(), query);
    };

    const visibleItems = computed(() => {
        const matching = orderedItems().filter((item) => matchesFilter(item));
        const limit = config.limit();
        return limit >= 0 ? matching.slice(0, limit) : matching;
    });

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

    const highlight = useListHighlight<ComboboxItemRef>({
        items: orderedItems,
        isNavigable: (item) => isVisible(item) && !item.disabled(),
        getId: (item) => item.id,
        loop: config.loopFocus,
        injector
    });

    const highlightedItem = highlight.highlightedItem;
    const highlightedIndex = signal(-1);
    const highlightReason = signal<ComboboxHighlightReason>('none');

    const itemId = (index: number): string => `${listId}-item-${index}`;

    const activeId = computed(() => {
        if (config.virtualized()) {
            const index = highlightedIndex();
            return index >= 0 ? itemId(index) : undefined;
        }
        return highlight.activeId();
    });

    // `'first-match'` highlights the first item whose label prefix-matches the query (inline modes),
    // so inline completion lands on a real prefix even when the list is static.
    const pendingHighlightEdge = signal<'first' | 'last' | 'first-match' | null>(null);

    // Inline completion (autocomplete `both` / `inline`): a transient preview of the highlighted item's
    // label mirrored into the input. `null` when off. `suppressInline` skips it for a deleting edit.
    const inlinePreview = signal<string | null>(null);
    let suppressInline = false;

    /** The first visible, navigable item whose label starts with the query (for inline completion). */
    const firstMatchItem = (): ComboboxItemRef | null => {
        const query = config.query();
        if (!query) {
            return null;
        }
        const lower = query.toLowerCase();
        return (
            visibleItems().find((item) => !item.disabled() && item.textValue().toLowerCase().startsWith(lower)) ?? null
        );
    };

    /** The first visible, navigable item (auto-highlight fallback when no prefix match exists). */
    const firstVisibleNavigable = (): ComboboxItemRef | null => visibleItems().find((item) => !item.disabled()) ?? null;

    /** Resolves a pending edge to a virtualized index (`'first-match'` → first prefix match, else 0). */
    const resolveVirtualizedEdge = (edge: 'first' | 'last' | 'first-match', count: number): number => {
        if (edge === 'last') {
            return count - 1;
        }
        if (edge === 'first-match') {
            const query = config.query();
            if (query) {
                const lower = query.toLowerCase();
                const index = filteredItems().findIndex((value) =>
                    config.itemToString(value).toLowerCase().startsWith(lower)
                );
                if (index >= 0) {
                    return index;
                }
            }
        }
        return 0;
    };

    /** The active highlight's label, DOM-ref or virtualized (resolved from the index). `null` when none. */
    const activeLabel = (): string | null => {
        if (config.virtualized()) {
            const index = highlightedIndex();
            const value = index >= 0 ? filteredItems()[index] : undefined;
            return value === undefined ? null : config.itemToString(value);
        }
        return highlightedItem()?.textValue() ?? null;
    };

    const recomputeInlinePreview = (label: string | null, query: string, reason: ComboboxHighlightReason): void => {
        // Pointer hover must not rewrite the input (matches Base UI); only typing / keyboard nav complete it.
        if (!config.inlineMode() || suppressInline || !label || reason === 'pointer') {
            inlinePreview.set(null);
            return;
        }
        if (query && label.toLowerCase().startsWith(query.toLowerCase())) {
            // Type-ahead: keep the typed prefix (preserving its casing) and complete the rest.
            inlinePreview.set(query + label.slice(query.length));
            return;
        }
        // Keyboard navigation to a non-prefix item: show its full label so the input reflects it.
        if (reason === 'keyboard') {
            inlinePreview.set(label);
            return;
        }
        inlinePreview.set(null);
    };

    const transition = useTransitionStatus(config.onOpenChangeComplete);

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

    // Emit highlight changes (skip the initial run). Tracks both the DOM-ref highlight and the
    // virtualized index; only one is active per mode, so the other never fires spuriously.
    let highlightInitialized = false;
    effect(
        () => {
            const item = highlightedItem();
            const index = highlightedIndex();
            if (!highlightInitialized) {
                highlightInitialized = true;
                return;
            }
            untracked(() => {
                if (config.virtualized()) {
                    const value = index >= 0 ? (filteredItems()[index] ?? null) : null;
                    // No active highlight (e.g. filtering pushed the index out of range) carries no
                    // interaction — report 'none', not a stale 'keyboard'/'pointer' reason.
                    config.onItemHighlighted({ value, index, reason: value === null ? 'none' : highlightReason() });
                } else {
                    const value = item ? item.value() : null;
                    const itemIndex = item ? visibleItems().indexOf(item) : -1;
                    // DOM-mode self-heal in `useListHighlight` clears `highlighted` without touching
                    // `highlightReason`; treat a null highlight as 'none' so the emit isn't mis-reported.
                    config.onItemHighlighted({
                        value,
                        index: itemIndex,
                        reason: item === null ? 'none' : highlightReason()
                    });
                }
            });
        },
        { injector }
    );

    // Apply a deferred open-edge highlight once items (DOM refs) or filtered data have registered.
    effect(
        () => {
            const edge = pendingHighlightEdge();
            const count = config.virtualized() ? filteredItems().length : orderedItems().length;
            if (!config.open() || edge === null || count === 0) {
                return;
            }
            untracked(() => {
                // Programmatic move — reset the reason so the emit reports 'none', not a stale interaction.
                highlightReason.set('none');
                if (config.virtualized()) {
                    highlightedIndex.set(resolveVirtualizedEdge(edge, count));
                } else if (edge === 'last') {
                    highlight.last();
                } else if (edge === 'first-match') {
                    highlight.set(firstMatchItem() ?? firstVisibleNavigable());
                } else {
                    highlight.first();
                }
                pendingHighlightEdge.set(null);
            });
        },
        { injector }
    );

    // Inline completion: mirror the active item's label into the input. Tracks the DOM-ref highlight,
    // the virtualized index, the query, the reason, and `inlineMode` — so virtualized navigation and a
    // `both → list` mode switch both recompute (and clear) the preview. No-op (null) when off (combobox).
    effect(
        () => {
            config.inlineMode();
            highlightedItem();
            highlightedIndex();
            const query = config.query();
            const reason = highlightReason();
            untracked(() => recomputeInlinePreview(activeLabel(), query, reason));
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
                            highlightReason.set('none');
                            highlightedIndex.set(0);
                        }
                    } else if (highlightedItem() === null) {
                        highlightReason.set('none');
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
                    highlightReason.set('none');
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
            highlight.set(row[0] ?? null);
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
        labelId: labelId.asReadonly(),
        setLabelId(id: string | undefined): void {
            labelId.set(id);
        },
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
            _items.update((items) => [...items, item]);
        },
        unregisterItem(item: ComboboxItemRef): void {
            _items.update((items) => items.filter((i) => i !== item));
        },

        highlight,
        highlightedItem,
        highlightedIndex: highlightedIndex.asReadonly(),
        activeId,
        itemId,
        setHighlightReason(reason: ComboboxHighlightReason): void {
            highlightReason.set(reason);
        },
        setPendingHighlightEdge(edge: 'first' | 'last' | 'first-match' | null): void {
            pendingHighlightEdge.set(edge);
        },

        /** Transient inline-completion preview (autocomplete inline modes); `null` when inactive. */
        inlinePreview: inlinePreview.asReadonly(),
        /** Suppress inline completion for the current edit (e.g. while a delete key is held). */
        setSuppressInline(value: boolean): void {
            suppressInline = value;
        },
        /** Clear the inline preview synchronously (on select / clear / close, before the effect runs). */
        clearInlinePreview(): void {
            inlinePreview.set(null);
        },

        highlightNext(reason: ComboboxHighlightReason = 'keyboard'): void {
            highlightReason.set(reason);
            if (config.virtualized()) {
                stepIndex(1);
            } else if (config.grid()) {
                gridVertical(1);
            } else {
                highlight.next();
            }
        },
        highlightPrevious(reason: ComboboxHighlightReason = 'keyboard'): void {
            highlightReason.set(reason);
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
            highlightReason.set(reason);
            highlight.next();
        },
        highlightPreviousColumn(reason: ComboboxHighlightReason = 'keyboard'): void {
            if (!config.grid() || config.virtualized()) {
                return;
            }
            highlightReason.set(reason);
            highlight.previous();
        },
        highlightFirst(reason: ComboboxHighlightReason = 'keyboard'): void {
            highlightReason.set(reason);
            if (config.virtualized()) {
                highlightedIndex.set(filteredItems().length > 0 ? 0 : -1);
            } else {
                highlight.first();
            }
        },
        highlightLast(reason: ComboboxHighlightReason = 'keyboard'): void {
            highlightReason.set(reason);
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
            highlightReason.set(reason);
            highlightedIndex.set(index);
        },
        setHighlight(item: ComboboxItemRef, reason: ComboboxHighlightReason): void {
            highlightReason.set(reason);
            highlight.set(item);
        },
        clearHighlightState(): void {
            highlight.clear();
            highlightedIndex.set(-1);
        },

        isKeyboardActive(): boolean {
            return keyboardActive;
        },
        setKeyboardActive(value: boolean): void {
            keyboardActive = value;
        },

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
