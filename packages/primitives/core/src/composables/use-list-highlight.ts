import { computed, effect, Injector, Signal, signal, untracked } from '@angular/core';

/** Options for {@link useListHighlight}. */
export interface UseListHighlightOptions<T> {
    /** All items in DOM order (e.g. a collection provider's `items()`). */
    items: Signal<readonly T[]>;
    /**
     * Whether an item can be highlighted — must return `false` for hidden (filtered-out) and
     * disabled items. Navigation and self-healing both consult this.
     */
    isNavigable: (item: T) => boolean;
    /** Resolves the item's element id, exposed as {@link ListHighlight.activeId} for `aria-activedescendant`. */
    getId: (item: T) => string | undefined;
    /** Whether navigation wraps at the boundaries. Defaults to `true`. */
    loop?: Signal<boolean>;
    /** Injector to bind the self-healing effect to when not called in an injection context. */
    injector?: Injector;
}

/** Highlight-model navigation API returned by {@link useListHighlight}. */
export interface ListHighlight<T> {
    /** The currently highlighted item, or `null`. DOM focus is never moved by this state. */
    readonly highlightedItem: Signal<T | null>;
    /** The highlighted item's element id, or `undefined`. Bind to `aria-activedescendant`. */
    readonly activeId: Signal<string | undefined>;
    /** Highlight the first navigable item. */
    first(): void;
    /** Highlight the last navigable item. */
    last(): void;
    /** Highlight the next navigable item (wraps when `loop`). */
    next(): void;
    /** Highlight the previous navigable item (wraps when `loop`). */
    previous(): void;
    /** Highlight a specific item (ignored if not navigable); pass `null` to clear. */
    set(item: T | null): void;
    /** Clear the highlight. */
    clear(): void;
}

/**
 * Highlight-model list navigation over a set of items, decoupled from DOM focus.
 *
 * Unlike roving `tabindex`, the highlight is pure state: callers move it with the keyboard while DOM
 * focus stays on a single controlling element (e.g. a combobox `<input>`), which exposes
 * {@link ListHighlight.activeId} as `aria-activedescendant`. Navigation only ever lands on items for
 * which `isNavigable` returns `true`, so hidden (filtered-out) and disabled items are skipped. A
 * self-healing effect clears the highlight if its item stops being navigable or leaves the list, so
 * `activeId` never references a detached or hidden element.
 *
 * Must be called in an injection context, or given an `injector`.
 */
export function useListHighlight<T>(options: UseListHighlightOptions<T>): ListHighlight<T> {
    const { items, isNavigable, getId, loop, injector } = options;

    const highlighted = signal<T | null>(null);

    const navigable = computed(() => items().filter((item) => isNavigable(item)));

    const activeId = computed(() => {
        const item = highlighted();
        return item === null ? undefined : getId(item);
    });

    const setIfNavigable = (item: T | null): void => {
        if (item === null || isNavigable(item)) {
            highlighted.set(item);
        }
    };

    const step = (direction: 1 | -1): void => {
        const list = navigable();
        if (list.length === 0) {
            highlighted.set(null);
            return;
        }

        const current = highlighted();
        const currentIndex = current === null ? -1 : list.indexOf(current);

        // No valid anchor → enter from the appropriate end.
        if (currentIndex === -1) {
            highlighted.set(direction === 1 ? list[0] : list[list.length - 1]);
            return;
        }

        let nextIndex = currentIndex + direction;
        const shouldLoop = loop ? loop() : true;

        if (nextIndex < 0) {
            nextIndex = shouldLoop ? list.length - 1 : 0;
        } else if (nextIndex >= list.length) {
            nextIndex = shouldLoop ? 0 : list.length - 1;
        }

        highlighted.set(list[nextIndex]);
    };

    // Self-heal: drop a highlight that is no longer navigable (filtered out, disabled, destroyed).
    effect(
        () => {
            const list = navigable();
            const current = untracked(highlighted);
            if (current !== null && !list.includes(current)) {
                highlighted.set(null);
            }
        },
        injector ? { injector } : undefined
    );

    return {
        highlightedItem: highlighted.asReadonly(),
        activeId,
        first() {
            const list = navigable();
            highlighted.set(list.length > 0 ? list[0] : null);
        },
        last() {
            const list = navigable();
            highlighted.set(list.length > 0 ? list[list.length - 1] : null);
        },
        next() {
            step(1);
        },
        previous() {
            step(-1);
        },
        set: setIfNavigable,
        clear() {
            highlighted.set(null);
        }
    };
}
