import { DestroyRef, Directive, ElementRef, effect, inject, input } from '@angular/core';
import { COLLECTION_CONTEXT_TOKEN, CollectionContext } from './collection-context';

@Directive({
    selector: '[rdxCollectionItem]',
    host: {
        '[attr.data-rdx-collection-item]': '""'
    }
})
export class RdxCollectionItem {
    private readonly hostElementRef = inject(ElementRef<HTMLElement>).nativeElement;
    private readonly context = inject<CollectionContext>(COLLECTION_CONTEXT_TOKEN);
    private readonly destroyRef = inject(DestroyRef);

    readonly value = input<any>(undefined);

    constructor() {
        effect(() => {
            const currentValue = this.value();
            this.context.itemMap.update((curr) => {
                const next = new Map(curr);
                next.set(this.hostElementRef, { ref: this.hostElementRef, value: currentValue });
                return next;
            });
        });

        this.destroyRef.onDestroy(() => {
            this.context.itemMap.update((curr) => {
                const next = new Map(curr);
                next.delete(this.hostElementRef);
                return next;
            });
        });
    }
}
