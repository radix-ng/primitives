import { computed, Directive, ElementRef, inject } from '@angular/core';
import { RdxCompositeListItem } from './composite-list-item';
import { injectRdxCompositeRootContext } from './composite-root';
import { RdxCompositeItemMetadata } from './types';

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
        '(mousemove)': 'handleMouseMove()'
    }
})
export class RdxCompositeItem {
    private readonly rootContext = injectRdxCompositeRootContext(true);
    private readonly listItem = inject(RdxCompositeListItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly index = this.listItem.index;
    private readonly inRootElement = computed(() => {
        const rootContext = this.rootContext;
        return !!rootContext && rootContext.rootElement.contains(this.elementRef.nativeElement);
    });
    protected readonly highlighted = computed(() => this.rootContext?.highlightedIndex() === this.index());
    protected readonly tabIndex = computed(() => {
        const rootContext = this.rootContext;

        if (!rootContext || !this.inRootElement()) {
            return null;
        }

        const index = this.index();
        return index !== -1 && rootContext.highlightedIndex() === index && !rootContext.isIndexDisabled(index) ? 0 : -1;
    });

    setMetadata(value: RdxCompositeItemMetadata | null | undefined): void {
        this.listItem.setMetadata(value);
    }

    protected handleFocus(): void {
        const index = this.index();

        if (this.inRootElement() && index !== -1) {
            this.rootContext?.setHighlightedIndex(index);
        }
    }

    protected handleMouseMove(): void {
        const rootContext = this.rootContext;
        const index = this.index();

        if (
            !this.inRootElement() ||
            !rootContext ||
            index === -1 ||
            !rootContext.highlightItemOnHover() ||
            this.highlighted()
        ) {
            return;
        }

        if (!rootContext.isIndexDisabled(index)) {
            this.elementRef.nativeElement.focus();
        }
    }
}
