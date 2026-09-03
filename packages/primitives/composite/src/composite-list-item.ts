import {
    afterNextRender,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    signal,
    untracked
} from '@angular/core';
import { injectRdxCompositeItemOwner } from './composite-item-owner';
import { injectRdxCompositeListContext } from './composite-list';
import { RdxCompositeItemMetadata, RdxCompositeListContext } from './types';

/**
 * Registers the host with the nearest composite list without changing focus behavior.
 */
@Directive({
    selector: '[rdxCompositeListItem]',
    exportAs: 'rdxCompositeListItem'
})
export class RdxCompositeListItem {
    private readonly owner = injectRdxCompositeItemOwner();
    private readonly injectedListContext = this.owner ? null : injectRdxCompositeListContext(true);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly hasRendered = signal(false);

    private readonly listContext = computed(() => (this.owner ? this.owner.listContext() : this.injectedListContext));

    /** Arbitrary metadata included in the list's ordered item map. */
    readonly metadataInput = input<RdxCompositeItemMetadata | null | undefined>(undefined, { alias: 'metadata' });
    private readonly _metadata = linkedSignal(() => this.metadataInput());

    readonly index = computed(() => this.listContext()?.indexOf(this.elementRef.nativeElement) ?? -1);

    constructor() {
        afterNextRender(() => {
            this.hasRendered.set(true);
        });

        effect((onCleanup) => {
            const listContext = this.listContext();
            if (!listContext || !this.hasRendered() || !this.isInListElement(listContext)) {
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

    private isInListElement(listContext: RdxCompositeListContext | null): boolean {
        return !!listContext && listContext.listElement.contains(this.elementRef.nativeElement);
    }
}
