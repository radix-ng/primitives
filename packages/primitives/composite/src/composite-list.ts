import { computed, Directive, effect, ElementRef, inject, output } from '@angular/core';
import { createContext, useElementRegistry } from '@radix-ng/primitives/core';
import {
    RdxCompositeItemMetadata,
    RdxCompositeItemRegistration,
    RdxCompositeListContext,
    RdxCompositeMetadata
} from './types';

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

    private readonly registry = useElementRegistry<RdxCompositeItemRegistration>();

    /** Emits when the ordered item map changes. */
    readonly onMapChange = output<Map<HTMLElement, RdxCompositeMetadata>>();

    /** Items registered with this list, sorted in DOM order. */
    readonly items = this.registry.items;

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
        return this.registry.register(item);
    }

    indexOf(element: HTMLElement): number {
        return this.registry.indexOf(element);
    }

    elements(): HTMLElement[] {
        return this.registry.elements();
    }
}
