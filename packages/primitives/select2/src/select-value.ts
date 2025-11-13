import { afterNextRender, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { AcceptableValue } from '@radix-ng/primitives/core';
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
    readonly rootContext = injectSelectRootContext()!;

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly placeholder = input<string>();

    readonly slotText = computed(() => {
        return this.selectedLabel().length ? this.selectedLabel().join(', ') : this.placeholder();
    });

    readonly selectedLabel = computed(() => {
        let list: string[] = [];
        const options = Array.from(this.rootContext.optionsSet());

        const getOption = (value?: AcceptableValue) =>
            options.find((option) => valueComparator(value, option.value, this.rootContext.by()));
        if (Array.isArray(this.rootContext.value())) {
            list = Array(this.rootContext.value()).map((value) => getOption(value)?.textContent ?? '');
        } else {
            list = [getOption(this.rootContext.value())?.textContent ?? ''];
        }
        return list.filter(Boolean);
    });

    constructor() {
        afterNextRender(() => {
            this.rootContext.valueElement.set(this.elementRef.nativeElement);
        });
    }
}
