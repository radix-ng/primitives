import { computed, contentChildren, Directive } from '@angular/core';
import { RdxCollectionItem } from './collection-item';

/**
 * Collects {@link RdxCollectionItem} descendants in DOM order, reactively, using Angular's
 * `contentChildren`. Matches host directives too, so items composed via `hostDirectives` are found.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxCollectionProvider]',
    exportAs: 'rdxCollectionProvider'
})
export class RdxCollectionProvider {
    /** All items, in DOM order. */
    readonly items = contentChildren(RdxCollectionItem, { descendants: true });

    /** Items that are not disabled. Recomputes when an item's `disabled` flag changes. */
    readonly enabledItems = computed(() => this.items().filter((item) => !item.disabled()));

    /** Returns the collection items, excluding disabled ones unless `includeDisabled` is `true`. */
    getItems(includeDisabled = false): readonly RdxCollectionItem[] {
        return includeDisabled ? this.items() : this.enabledItems();
    }
}
