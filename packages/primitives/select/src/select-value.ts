import { afterNextRender, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { AcceptableValue, itemToStringLabel as defaultItemToStringLabel } from '@radix-ng/primitives/core';
import { injectSelectRootContext } from './select-root';
import { valueComparator } from './utils';

@Directive({
    selector: 'span[rdxSelectValue]',
    exportAs: 'rdxSelectedValue',
    host: {
        '[style.pointer-events]': '"none"'
    }
})
export class RdxSelectValue {
    readonly rootContext = injectSelectRootContext();

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly placeholder = input<string>();

    readonly slotText = computed(() => {
        return this.selectedLabel().length ? this.selectedLabel().join(', ') : this.placeholder();
    });

    readonly selectedLabel = computed(() => {
        const options = Array.from(this.rootContext.optionsSet());
        const customLabel = this.rootContext.itemToStringLabel();

        const labelFor = (value?: AcceptableValue): string => {
            if (customLabel && value !== undefined && value !== null) {
                return customLabel(value);
            }
            const option = options.find((o) => valueComparator(value, o.value, this.rootContext.isItemEqualToValue()));
            return option?.textContent ?? defaultItemToStringLabel(value);
        };

        const value = this.rootContext.value();
        const list = Array.isArray(value) ? value.map((v) => labelFor(v)) : [labelFor(value)];
        return list.filter(Boolean);
    });

    constructor() {
        afterNextRender(() => {
            this.rootContext.valueElement.set(this.elementRef.nativeElement);
        });
    }
}
