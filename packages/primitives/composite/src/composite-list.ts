import { computed, Directive, effect, ElementRef, inject, output, signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
import {
    RdxCompositeItemMetadata,
    RdxCompositeItemRegistration,
    RdxCompositeListContext,
    RdxCompositeMetadata
} from './types';
import { compareNodeDocumentPosition, getAdjacentNodeRoots, hasMovedNode, sortByDocumentPosition } from './utils';

const listContext = (): RdxCompositeListContext => {
    const list = inject(RdxCompositeList);

    return {
        listElement: list.elementRef.nativeElement,
        items: list.items,
        itemMap: list.itemMap,
        registerItem: (item) => list.registerItem(item),
        indexOf: (element) => list.indexOf(element)
    };
};

export const [injectRdxCompositeListContext, provideRdxCompositeListContext] = createContext<RdxCompositeListContext>(
    'RdxCompositeListContext',
    'utils/composite'
);

/**
 * Base UI-style composite list. Owns item registration and DOM-order metadata without applying
 * roving tabindex or keyboard navigation.
 */
@Directive({
    selector: '[rdxCompositeList]',
    exportAs: 'rdxCompositeList',
    providers: [provideRdxCompositeListContext(listContext)]
})
export class RdxCompositeList {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly registeredItems = signal<RdxCompositeItemRegistration[]>([]);

    /**
     * Bumped when registered items are moved in the DOM without re-registering
     * (e.g. an `@for` reorder that reuses views). Angular does not re-run the item
     * registration effect on such moves, so `registeredItems` is unchanged and the
     * document-order sort would go stale; a MutationObserver detects the move and
     * bumps this tick to force `items` to re-sort. Mirrors Base UI's composite list.
     */
    private readonly reorderTick = signal(0);

    /** Emits when the ordered item map changes. */
    readonly onMapChange = output<Map<HTMLElement, RdxCompositeMetadata>>();

    /** Items registered with this list, sorted in DOM order. */
    readonly items = computed(() => {
        this.reorderTick();
        return sortByDocumentPosition(this.registeredItems());
    });

    /** Ordered metadata keyed by item element. */
    readonly itemMap = computed(() => {
        const map = new Map<HTMLElement, RdxCompositeMetadata>();

        this.items().forEach((item, index) => {
            map.set(item.element, { ...(item.metadata() ?? {}), index });
        });

        return map;
    });

    constructor() {
        effect(() => {
            this.onMapChange.emit(this.itemMap());
        });

        this.observeItemReordering();
    }

    /**
     * Watches the smallest containers that bound the registered items and re-sorts
     * when a move inverts their document order. Re-established whenever the item set
     * changes; a no-op where `MutationObserver` is unavailable (SSR).
     */
    private observeItemReordering(): void {
        if (typeof MutationObserver !== 'function') {
            return;
        }

        effect((onCleanup) => {
            const orderedNodes = this.items().map((item) => item.element);

            // A single item cannot reorder.
            if (orderedNodes.length < 2) {
                return;
            }

            const roots = getAdjacentNodeRoots(orderedNodes);
            if (roots.size === 0) {
                return;
            }

            const observer = new MutationObserver((entries) => {
                // Only react to moves; pure adds/removals re-sort through registration.
                if (!hasMovedNode(entries)) {
                    return;
                }

                let previous: Element | null = null;

                for (const node of orderedNodes) {
                    if (!node.isConnected) {
                        continue;
                    }

                    // A connected node now preceding its predecessor means the order inverted.
                    if (previous && compareNodeDocumentPosition(previous, node) > 0) {
                        observer.disconnect();
                        this.reorderTick.update((tick) => tick + 1);
                        return;
                    }

                    previous = node;
                }
            });

            roots.forEach((root) => observer.observe(root, { childList: true }));

            onCleanup(() => observer.disconnect());
        });
    }

    registerItem<Metadata extends RdxCompositeItemMetadata>(item: RdxCompositeItemRegistration<Metadata>): () => void {
        this.registeredItems.update((items) => [
            ...items.filter((registered) => registered.element !== item.element),
            item
        ]);

        return () => {
            this.registeredItems.update((items) => items.filter((registered) => registered.element !== item.element));
        };
    }

    indexOf(element: HTMLElement): number {
        return this.items().findIndex((item) => item.element === element);
    }

    elements(): HTMLElement[] {
        return this.items().map((item) => item.element);
    }
}
