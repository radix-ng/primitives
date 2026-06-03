import { injectSelectItemContext } from './select-item';
import { injectSelectPopupContext } from './select-popup';
import { injectSelectRootContext } from './select-root';
import { afterNextRender, computed, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[rdxSelectItemText]',
    host: {
        '[id]': 'itemContext.textId'
    }
})
export class RdxSelectItemText {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    readonly rootContext = injectSelectRootContext();
    readonly contentContext = injectSelectPopupContext();
    readonly itemContext = injectSelectItemContext();

    readonly optionProps = computed(() => {
        return {
            value: this.itemContext.value(),
            disabled: this.itemContext.disabled(),
            textContent: this.elementRef.nativeElement.textContent ?? this.itemContext.value()?.toString() ?? ''
        };
    });

    constructor() {
        afterNextRender(() => {
            this.itemContext.onItemTextChange(this.elementRef.nativeElement);
            this.contentContext.itemTextRefCallback(
                this.elementRef.nativeElement,
                this.itemContext.value(),
                this.itemContext.disabled()
            );

            this.rootContext.onOptionAdd(this.optionProps);
        });

        const destroyRef = inject(DestroyRef);

        destroyRef.onDestroy(() => {
            this.rootContext.onOptionRemove(this.optionProps);
        });
    }
}
