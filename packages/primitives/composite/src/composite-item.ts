import { computed, Directive, ElementRef, inject } from '@angular/core';
import { isStationaryWebKitPointer } from '@radix-ng/primitives/core';
import { injectRdxCompositeItemOwner } from './composite-item-owner';
import { RdxCompositeListItem } from './composite-list-item';
import { injectRdxCompositeRootContext } from './composite-root';
import { RdxCompositeItemMetadata, RdxCompositeRootContext } from './types';

/**
 * Internal Base UI-style composite item. Registers itself with the nearest composite root and
 * receives the roving `tabindex` from the root's highlighted index.
 */
@Directive({
    selector: '[rdxCompositeItem]',
    exportAs: 'rdxCompositeItem',
    hostDirectives: [
        {
            directive: RdxCompositeListItem,
            inputs: ['metadata']
        }
    ],
    host: {
        '[attr.tabindex]': 'tabIndex()',
        '(focus)': 'handleFocus()',
        '(mousemove)': 'handleMouseMove($event)'
    }
})
export class RdxCompositeItem {
    private readonly owner = injectRdxCompositeItemOwner();
    private readonly injectedRootContext = this.owner ? null : injectRdxCompositeRootContext(true);
    private readonly listItem = inject(RdxCompositeListItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly rootContext = computed(() => (this.owner ? this.owner.rootContext() : this.injectedRootContext));

    readonly index = this.listItem.index;
    protected readonly tabIndex = computed(() => {
        const rootContext = this.rootContext();

        if (!this.isInRootElement(rootContext)) {
            return null;
        }

        const index = this.index();
        return index !== -1 && rootContext.highlightedIndex() === index && !rootContext.isIndexDisabled(index) ? 0 : -1;
    });

    setMetadata(value: RdxCompositeItemMetadata | null | undefined): void {
        this.listItem.setMetadata(value);
    }

    protected handleFocus(): void {
        const rootContext = this.rootContext();
        const index = this.index();

        if (index !== -1 && this.isInRootElement(rootContext)) {
            rootContext.setHighlightedIndex(index);
        }
    }

    protected handleMouseMove(event: MouseEvent): void {
        // WebKit fires zero-delta moves while the list scrolls under a still cursor.
        if (isStationaryWebKitPointer(event)) {
            return;
        }
        const rootContext = this.rootContext();
        const index = this.index();

        if (
            !this.isInRootElement(rootContext) ||
            index === -1 ||
            !rootContext.highlightItemOnHover() ||
            rootContext.highlightedIndex() === index
        ) {
            return;
        }

        if (!rootContext.isIndexDisabled(index)) {
            this.elementRef.nativeElement.focus();
        }
    }

    private isInRootElement(rootContext: RdxCompositeRootContext | null): rootContext is RdxCompositeRootContext {
        return !!rootContext && rootContext.rootElement.contains(this.elementRef.nativeElement);
    }
}
