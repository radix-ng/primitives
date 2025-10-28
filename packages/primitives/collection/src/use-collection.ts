import { computed, inject } from '@angular/core';
import { COLLECTION_CONTEXT_TOKEN, CollectionContext } from './collection-context';

export function useCollection() {
    const context = inject<CollectionContext>(COLLECTION_CONTEXT_TOKEN);

    const reactiveItems = computed(() => Array.from(context.itemMap().values()));
    const itemMapSize = computed(() => context.itemMap().size);

    function getItems(includeDisabledItem = false) {
        const root = context.collectionElementRef();
        if (!root) return [];

        const orderedNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-rdx-collection-item]'));

        const items = Array.from(context.itemMap().values());
        items.sort((a, b) => orderedNodes.indexOf(a.ref) - orderedNodes.indexOf(b.ref));

        return includeDisabledItem ? items : items.filter((i) => i.ref.dataset['disabled'] !== '');
    }

    return { getItems, reactiveItems, itemMapSize };
}
