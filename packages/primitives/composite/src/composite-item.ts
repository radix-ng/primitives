import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import {
    coerceTabIndex,
    injectTabIndexAttribute,
    isStationaryWebKitPointer,
    NumberInput
} from '@radix-ng/primitives/core';
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

    /**
     * Authored tabindex, overriding the default roving value.
     * `null` removes the attribute; `undefined` restores the default.
     * @defaultValue undefined
     */
    readonly tabIndexInput = input<number | null | undefined, NumberInput>(injectTabIndexAttribute(), {
        alias: 'tabIndex',
        transform: coerceTabIndex
    });

    /** @internal Shared with behavior directives on this same composite item. */
    readonly tabIndex = computed(() => {
        const authored = this.tabIndexInput();
        if (authored !== undefined) return authored;
        if (this.owner?.tabIndex) {
            return this.owner.tabIndex();
        }

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

    /** @internal Restoring an existing focus must not request activation again. */
    isRestoringFocus(): boolean {
        return this.rootContext()?.isRestoringFocus?.() ?? false;
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
