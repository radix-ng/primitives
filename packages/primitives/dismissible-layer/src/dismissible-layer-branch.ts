import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { RdxDismissibleLayersContextToken } from './dismissible-layer.config';

@Directive({
    selector: '[rdxDismissibleLayerBranch]'
})
export class RdxDismissibleLayerBranch {
    private readonly dismissibleLayersContext = inject(RdxDismissibleLayersContextToken);

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    constructor() {
        this.dismissibleLayersContext.branches.update((v) => [...v, this.elementRef.nativeElement]);

        inject(DestroyRef).onDestroy(() =>
            this.dismissibleLayersContext.branches.update((v) => v.filter((i) => i !== this.elementRef.nativeElement))
        );
    }
}
