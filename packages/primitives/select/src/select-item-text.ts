import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { injectSelectItemContext } from './select-item';
import { injectSelectPopupContext } from './select-popup';

@Directive({
    selector: '[rdxSelectItemText]',
    host: {
        '[id]': 'itemContext.textId'
    }
})
export class RdxSelectItemText {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    readonly contentContext = injectSelectPopupContext();
    readonly itemContext = injectSelectItemContext();

    constructor() {
        const destroyRef = inject(DestroyRef);
        afterNextRender(() => {
            const unregister = this.itemContext.onItemTextChange(this.elementRef.nativeElement);
            destroyRef.onDestroy(unregister);
            this.contentContext.itemTextRefCallback(
                this.elementRef.nativeElement,
                this.itemContext.value(),
                this.itemContext.disabled()
            );
        });
    }
}
