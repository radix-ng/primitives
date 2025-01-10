import { Component, computed, inject } from '@angular/core';
import { RdxSliderRootComponent } from './slider-root.component';
import { convertValueToPercentage } from './utils';

@Component({
    selector: 'rdx-slider-range',
    host: {
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[style]': 'rangeStyles()'
    },
    template: `
        <ng-content />
    `
})
export class RdxSliderRangeComponent {
    protected readonly rootContext = inject(RdxSliderRootComponent);

    percentages = computed(() =>
        this.rootContext
            .modelValue()
            ?.map((value) => convertValueToPercentage(value, this.rootContext.min(), this.rootContext.max()))
    );

    offsetStart = computed(() => (this.rootContext.modelValue()!.length > 1 ? Math.min(...this.percentages()!) : 0));
    offsetEnd = computed(() => 100 - Math.max(...this.percentages()!));

    rangeStyles = computed(() => {
        const context = this.rootContext.orientationContext.context;

        return {
            [context.startEdge]: `${this.offsetStart()}%`,
            [context.endEdge]: `${this.offsetEnd()}%`
        };
    });
}
