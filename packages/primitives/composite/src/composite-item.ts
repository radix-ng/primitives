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

        if (!this.hasOwningRoot(rootContext)) {
            return null;
        }

        const index = this.index();
        return index !== -1 && rootContext.highlightedIndex() === index && !rootContext.isIndexDisabled(index) ? 0 : -1;
    });

    /** @internal Disabled button guards forward the original event to their owned root. */
    relayKeyboardEvent(event: KeyboardEvent): void {
        this.rootContext()?.relayKeyboardEvent(event);
    }

    /** @internal Opt in to navigation through the injected root when this item moves to a portal. */
    enablePortaledNavigation(): void {
        this.listItem.allowPortaledHost = true;
    }

    /** @internal Forward a key that cannot bubble to the injected root after relocation. */
    relayPortaledKeyboardEvent(event: KeyboardEvent): void {
        const element = this.elementRef.nativeElement;
        if (event.defaultPrevented || event.target !== element || !this.listItem.allowPortaledHost) return;
        const rootContext = this.rootContext();
        if (rootContext && !rootContext.rootElement.contains(element) && this.index() !== -1) {
            rootContext.relayKeyboardEvent(event);
        }
    }

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

        if (index !== -1 && this.hasOwningRoot(rootContext)) {
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
            !this.hasOwningRoot(rootContext) ||
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

    private hasOwningRoot(rootContext: RdxCompositeRootContext | null): rootContext is RdxCompositeRootContext {
        return (
            !!rootContext &&
            (this.listItem.allowPortaledHost || rootContext.rootElement.contains(this.elementRef.nativeElement))
        );
    }
}
