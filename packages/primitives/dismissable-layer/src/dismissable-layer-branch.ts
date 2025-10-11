import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { RdxDismissableLayersContextToken } from './dismissable-layer.config';

@Directive({
    selector: '[rdxDismissableLayerBranch]'
})
export class RdxDismissableLayerBranch {
    private readonly dismissableLayersContext = inject(RdxDismissableLayersContextToken);

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    constructor() {
        this.dismissableLayersContext.branches.update((v) => [...v, this.elementRef.nativeElement]);

        inject(DestroyRef).onDestroy(() =>
            this.dismissableLayersContext.branches.update((v) => v.filter((i) => i !== this.elementRef.nativeElement))
        );
    }
}
