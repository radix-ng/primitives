import { afterNextRender, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { hasSelectNullLabel, resolveSelectLabel } from './select-items';
import { injectSelectRootContext } from './select-root';

@Directive({
    selector: 'span[rdxSelectValue]',
    exportAs: 'rdxSelectedValue',
    host: {
        '[style.pointer-events]': '"none"',
        '[attr.data-placeholder]': 'rootContext.isEmptyModelValue() ? "" : undefined'
    }
})
export class RdxSelectValue {
    readonly rootContext = injectSelectRootContext();

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly placeholder = input<string>();

    readonly slotText = computed(() => {
        if (
            this.rootContext.isEmptyModelValue() &&
            this.placeholder() !== undefined &&
            !hasSelectNullLabel(this.rootContext.items())
        ) {
            return this.placeholder();
        }
        return this.selectedLabel().join(', ');
    });

    readonly selectedLabel = computed(() => {
        const items = this.rootContext.items();
        const customLabel = this.rootContext.itemToStringLabel();

        const value = this.rootContext.value();
        return (Array.isArray(value) ? value : [value]).map((entry) => resolveSelectLabel(entry, items, customLabel));
    });

    constructor() {
        afterNextRender(() => {
            this.rootContext.valueElement.set(this.elementRef.nativeElement);
        });
    }
}
