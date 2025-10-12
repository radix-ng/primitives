import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { RdxDismissableLayersContextToken } from './dismissable-layer.config';

@Directive({
    selector: '[rdxDismissableLayerBranch]'
})
export class RdxDismissableLayerBranch {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);

    private readonly dismissableLayersContext = inject(RdxDismissableLayersContextToken);

    constructor() {
        this.dismissableLayersContext.branches.update((elements) => [...elements, this.elementRef.nativeElement]);

        this.destroyRef.onDestroy(() =>
            this.dismissableLayersContext.branches.update((elements) =>
                elements.filter((el) => el !== this.elementRef.nativeElement)
            )
        );
    }
}
