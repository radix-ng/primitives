import { computed, Directive, effect, ElementRef, inject, input, linkedSignal, untracked } from '@angular/core';
import { injectRdxCompositeListContext } from './composite-list';
import { RdxCompositeItemMetadata } from './types';

/**
 * Registers the host with the nearest composite list without changing focus behavior.
 */
@Directive({
    selector: '[rdxCompositeListItem]',
    exportAs: 'rdxCompositeListItem'
})
export class RdxCompositeListItem {
    private readonly listContext = injectRdxCompositeListContext(true);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /** Arbitrary metadata included in the list's ordered item map. */
    readonly metadataInput = input<RdxCompositeItemMetadata | null | undefined>(undefined, { alias: 'metadata' });
    private readonly _metadata = linkedSignal(() => this.metadataInput());

    readonly index = computed(() => this.listContext?.indexOf(this.elementRef.nativeElement) ?? -1);
    readonly inListElement = computed(() => {
        const listContext = this.listContext;
        return !!listContext && listContext.listElement.contains(this.elementRef.nativeElement);
    });

    constructor() {
        effect((onCleanup) => {
            const listContext = this.listContext;
            if (!listContext || !this.inListElement()) {
                return;
            }

            const element = this.elementRef.nativeElement;
            const unregister = untracked(() =>
                listContext.registerItem({ element, metadata: this._metadata.asReadonly() })
            );

            onCleanup(unregister);
        });
    }

    setMetadata(value: RdxCompositeItemMetadata | null | undefined): void {
        this._metadata.set(value);
    }
}
