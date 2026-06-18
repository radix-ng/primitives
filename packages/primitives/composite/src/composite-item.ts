import { computed, Directive, effect, ElementRef, inject, input, linkedSignal, untracked } from '@angular/core';
import { injectRdxCompositeRootContext } from './composite-root';
import { RdxCompositeItemMetadata } from './types';

/**
 * Internal Base UI-style composite item. Registers itself with the nearest composite root and
 * receives the roving `tabindex` from the root's highlighted index.
 */
@Directive({
    selector: '[rdxCompositeItem]',
    exportAs: 'rdxCompositeItem',
    host: {
        '[attr.tabindex]': 'tabIndex()',
        '(focus)': 'handleFocus()',
        '(mousemove)': 'handleMouseMove()'
    }
})
export class RdxCompositeItem {
    private readonly rootContext = injectRdxCompositeRootContext(true);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /** Arbitrary metadata included in the root's ordered item map. */
    readonly metadataInput = input<RdxCompositeItemMetadata | null | undefined>(undefined, { alias: 'metadata' });
    private readonly _metadata = linkedSignal(() => this.metadataInput());

    readonly index = computed(() => this.rootContext?.indexOf(this.elementRef.nativeElement) ?? -1);
    protected readonly highlighted = computed(() => this.rootContext?.highlightedIndex() === this.index());
    protected readonly tabIndex = computed(() => {
        if (!this.rootContext) {
            return null;
        }

        const index = this.index();
        return index !== -1 && this.rootContext.highlightedIndex() === index && !this.rootContext.isIndexDisabled(index)
            ? 0
            : -1;
    });

    constructor() {
        effect((onCleanup) => {
            const rootContext = this.rootContext;
            if (!rootContext) {
                return;
            }

            const element = this.elementRef.nativeElement;
            const unregister = untracked(() =>
                rootContext.registerItem({ element, metadata: this._metadata.asReadonly() })
            );

            onCleanup(unregister);
        });
    }

    setMetadata(value: RdxCompositeItemMetadata | null | undefined): void {
        this._metadata.set(value);
    }

    protected handleFocus(): void {
        const index = this.index();

        if (index !== -1) {
            this.rootContext?.setHighlightedIndex(index);
        }
    }

    protected handleMouseMove(): void {
        const rootContext = this.rootContext;
        const index = this.index();

        if (!rootContext || index === -1 || !rootContext.highlightItemOnHover() || this.highlighted()) {
            return;
        }

        if (!rootContext.isIndexDisabled(index)) {
            this.elementRef.nativeElement.focus();
        }
    }
}
