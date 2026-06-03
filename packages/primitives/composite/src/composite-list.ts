import {
    RdxCompositeItemMetadata,
    RdxCompositeItemRegistration,
    RdxCompositeListContext,
    RdxCompositeMetadata
} from './types';
import { sortByDocumentPosition } from './utils';
import { computed, Directive, effect, ElementRef, inject, output, signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

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

    /** Emits when the ordered item map changes. */
    readonly onMapChange = output<Map<HTMLElement, RdxCompositeMetadata>>();

    /** Items registered with this list, sorted in DOM order. */
    readonly items = computed(() => sortByDocumentPosition(this.registeredItems()));

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
