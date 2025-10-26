import { Directive, ElementRef, forwardRef, inject, signal, WritableSignal } from '@angular/core';
import { COLLECTION_CONTEXT_TOKEN, CollectionContext } from './collection-context';

@Directive({
    selector: '[rdxCollectionProvider]',
    providers: [
        {
            provide: COLLECTION_CONTEXT_TOKEN,
            useExisting: forwardRef(() => RdxCollectionProvider)
        }
    ]
})
export class RdxCollectionProvider implements CollectionContext {
    private readonly elementRef = inject(ElementRef<HTMLElement>).nativeElement;

    readonly collectionElementRef = signal<HTMLElement | null>(this.elementRef);

    readonly itemMap: WritableSignal<Map<HTMLElement, any>> = signal(new Map());
}
