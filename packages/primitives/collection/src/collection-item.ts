import { booleanAttribute, Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Marks an element as a member of a collection. Items are discovered by the
 * {@link RdxCollectionProvider} via `contentChildren`, so registration is automatic — no manual
 * book-keeping or marker attributes are needed.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxCollectionItem]',
    exportAs: 'rdxCollectionItem'
})
export class RdxCollectionItem<T = unknown> {
    /** The host element of the item, read straight off the instance. */
    readonly element = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

    /** Arbitrary data associated with the item. */
    readonly value = input<T>();

    /** Whether the item is disabled. Disabled items are excluded from {@link RdxCollectionProvider.enabledItems}. */
    readonly disabled = input(false, { transform: booleanAttribute });
}
