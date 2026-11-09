import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { injectSelectItemContext } from './select-item';

@Directive({
    selector: '[rdxSelectItemText]',
    host: {
        '[id]': 'itemContext.textId'
    }
})
export class RdxSelectItemText {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    readonly itemContext = injectSelectItemContext();

    constructor() {
        const destroyRef = inject(DestroyRef);
        afterNextRender(() => {
            const unregister = this.itemContext.onItemTextChange(this.elementRef.nativeElement);
            destroyRef.onDestroy(unregister);
        });
    }
}
